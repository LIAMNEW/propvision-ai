import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Weekly new listing generator — uses AI to create realistic new property listings
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    try {
      const user = await base44.auth.me();
      if (user?.role !== 'admin') {
        return Response.json({ error: 'Forbidden' }, { status: 403 });
      }
    } catch {
      // automation scheduler - continue
    }

    // How many properties exist already
    const existing = await base44.asServiceRole.entities.Property.list();
    const existingCount = existing.length;

    // Use AI to generate 3-5 new realistic Australian investment property listings
    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are a PropVision AI data engine for Australian real estate investment. Generate exactly 4 new realistic Australian investment property listings currently FOR SALE in May 2026.

Current market context:
- RBA Cash Rate: 3.85% (Feb 2026 cut)
- National vacancy: 1.2% (very tight)
- Perth: 0.4% vacancy, +11.4% growth | Brisbane: 0.8%, +8.2% | Adelaide: 1.0%, +7.1% | Sydney: 1.4%, +6.1%
- Hot markets: Perth (WA), Brisbane inner suburbs (QLD), Adelaide (SA)
- Olympics 2032 catalyst corridor: Woolloongabba, New Farm, South Brisbane, Paddington (QLD)

Rules:
- These are ACTIVE FOR SALE listings on the market RIGHT NOW
- Focus on investment-grade suburbs in WA, QLD, SA, NSW, VIC
- Mix of houses, apartments, townhouses
- Price range: $420K–$2.1M
- Yield range: 3.8%–7.5% (Perth/QLD/SA skew higher)
- Generate realistic Australian street addresses with real house numbers and street names
- Use real suburb names and correct postcodes that actually exist in Australia
- investment_score must be A+, A, B+, or B
- ai_summary must clearly describe the property features AND investment case (2-3 sentences, written as a real estate listing)
- Do NOT use same suburb twice in one batch
- listing_status should always be "For Sale"
- listing_agent should be a realistic Australian real estate agency name`,
      response_json_schema: {
        type: "object",
        properties: {
          properties: {
            type: "array",
            items: {
              type: "object",
              properties: {
                address: { type: "string" },
                suburb: { type: "string" },
                state: { type: "string", enum: ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"] },
                postcode: { type: "string" },
                price: { type: "number" },
                bedrooms: { type: "number" },
                bathrooms: { type: "number" },
                car_spaces: { type: "number" },
                property_type: { type: "string", enum: ["House", "Apartment", "Townhouse", "Unit", "Land"] },
                investment_score: { type: "string", enum: ["A+", "A", "B+", "B"] },
                rental_yield: { type: "number" },
                capital_growth_5yr: { type: "number" },
                vacancy_rate: { type: "number" },
                weekly_rent: { type: "number" },
                weekly_cashflow: { type: "number" },
                risk_level: { type: "string", enum: ["Low", "Medium", "High"] },
                ai_summary: { type: "string" },
                latitude: { type: "number" },
                longitude: { type: "number" },
              }
            }
          }
        }
      }
    });

    const newProperties = result?.properties || [];
    const created = [];

    // Curated Australian residential property images by type
    const imagesByType = {
      House: [
        "https://images.unsplash.com/photo-1625602812206-5ec545ca1231?w=800&q=80", // Australian brick home
        "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&q=80", // modern Aus house
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",   // single storey suburban
        "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80", // double storey
        "https://images.unsplash.com/photo-1576941089067-2de3c901e126?w=800&q=80", // neat suburban house
        "https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=800&q=80", // white brick house
      ],
      Apartment: [
        "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80", // apartment building
        "https://images.unsplash.com/photo-1460317442991-0ec209397118?w=800&q=80", // modern apartments
        "https://images.unsplash.com/photo-1515263487990-61b07816b324?w=800&q=80", // apartment complex
        "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80", // apartment interior
      ],
      Townhouse: [
        "https://images.unsplash.com/photo-1605146769289-440113cc3d00?w=800&q=80", // row townhouses
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80", // modern townhouse
        "https://images.unsplash.com/photo-1592595896616-c37162298647?w=800&q=80", // attached townhouse
      ],
      Unit: [
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",   // unit block
        "https://images.unsplash.com/photo-1467987506553-8f3916508521?w=800&q=80", // brick units
      ],
      Land: [
        "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80", // land block
        "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80",   // vacant land
      ],
    };

    for (const prop of newProperties) {
      const images = imagesByType[prop.property_type] || imagesByType.House;
      const image_url = images[Math.floor(Math.random() * images.length)];

      const created_record = await base44.asServiceRole.entities.Property.create({
        ...prop,
        image_url,
        status: "active",
        data_source: "PropVision AI Engine",
        last_updated: new Date().toISOString().split('T')[0],
      });
      created.push(created_record.id);
    }

    // Also create a market alert about new listings
    if (created.length > 0) {
      await base44.asServiceRole.entities.MarketAlert.create({
        title: `${created.length} New Investment Listings Added`,
        message: `PropVision AI has sourced ${created.length} new investment-grade properties across WA, QLD, and SA. Check the Discover page for today's fresh listings.`,
        alert_type: "new_listing",
        severity: "info",
        is_read: false,
      });
    }

    return Response.json({
      success: true,
      created: created.length,
      total_properties: existingCount + created.length,
      message: `Added ${created.length} new listings`,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});