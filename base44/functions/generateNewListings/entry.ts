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
      prompt: `You are a PropVision AI data engine for Australian real estate investment. Generate exactly 4 new realistic Australian investment property listings for April 2026.

Current market context:
- RBA Cash Rate: 3.85% (Feb 2026 cut)
- National vacancy: 1.2% (very tight)
- Perth: 0.4% vacancy, +11.4% growth | Brisbane: 0.8%, +8.2% | Adelaide: 1.0%, +7.1% | Sydney: 1.4%, +6.1%
- Hot markets: Perth (WA), Brisbane inner suburbs (QLD), Adelaide (SA)
- Olympics 2032 catalyst corridor: Woolloongabba, New Farm, South Brisbane, Paddington (QLD)

Rules:
- Focus on investment-grade suburbs in WA, QLD, SA, NSW, VIC
- Mix of houses, apartments, townhouses
- Price range: $420K–$2.1M
- Yield range: 3.8%–7.5% (Perth/QLD/SA skew higher)
- Generate unique addresses and realistic postcodes
- investment_score must be A+, A, B+, or B
- Include compelling ai_summary (2-3 sentences about why it's a good investment)
- Use real suburb names that exist in Australia
- Do NOT use same suburb twice in one batch

Return ONLY valid JSON array with exactly 4 properties.`,
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

    // Assign stock property images by type
    const imagesByType = {
      House: [
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80",
        "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&q=80",
        "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&q=80",
        "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=600&q=80",
      ],
      Apartment: [
        "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&q=80",
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80",
      ],
      Townhouse: [
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80",
        "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600&q=80",
      ],
      Unit: [
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80",
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