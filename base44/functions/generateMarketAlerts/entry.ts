import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Daily market alerts generator — creates fresh AI-written market intelligence alerts
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

    // Fetch top properties and recent alerts for context
    const [properties, recentAlerts] = await Promise.all([
      base44.asServiceRole.entities.Property.list('-updated_date', 20),
      base44.asServiceRole.entities.MarketAlert.list('-created_date', 5),
    ]);

    const topProperties = properties.slice(0, 8).map(p =>
      `${p.address} (${p.suburb}, ${p.state}) — Score: ${p.investment_score}, Yield: ${p.rental_yield}%, Vacancy: ${p.vacancy_rate}%, Cashflow: $${p.weekly_cashflow}/wk`
    ).join('\n');

    const recentAlertTitles = recentAlerts.map(a => a.title).join(', ');

    const today = new Date().toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Australia/Sydney' });

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are PropVision AI's market intelligence engine. Generate 3 market alerts for Australian property investors for ${today}.

Current market data:
- RBA Cash Rate: 3.85% (cut 4 Feb 2026, 25bp)
- National vacancy: 1.2% vs 2.5% balanced benchmark
- Perth: 0.4% vacancy (record low), Brisbane: 0.8%, Adelaide: 1.0%, Sydney: 1.4%, Melbourne: 1.5%  
- 2025 growth: Perth +11.4%, Brisbane +8.2%, Adelaide +7.1%, Sydney +6.1%, Melbourne +3.2%
- Olympics 2032 catalyst: Woolloongabba, New Farm, South Brisbane precinct
- Current top properties:
${topProperties}

Do NOT repeat these recent alerts: ${recentAlertTitles || 'none'}

Generate 3 varied, specific, data-driven alerts. Mix types:
- Market updates (RBA, economic indicators, national trends)
- Suburb-specific alerts (vacancy changes, price movements, yield shifts)
- Property-specific alerts (score upgrades, price drops, hidden gems)
- Infrastructure/catalyst news (Olympics, mining, transport)

Make them feel real, specific, and actionable. Reference real suburbs and real data. Be brief but insightful.`,
      response_json_schema: {
        type: "object",
        properties: {
          alerts: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                message: { type: "string" },
                alert_type: { type: "string", enum: ["price_drop", "new_listing", "yield_change", "market_update", "suburb_alert"] },
                severity: { type: "string", enum: ["info", "warning", "critical"] },
                related_suburb: { type: "string" },
                related_state: { type: "string" },
              }
            }
          }
        }
      }
    });

    const alerts = result?.alerts || [];
    const created = [];

    for (const alert of alerts) {
      const record = await base44.asServiceRole.entities.MarketAlert.create({
        ...alert,
        is_read: false,
      });
      created.push(record.id);
    }

    return Response.json({
      success: true,
      created: created.length,
      alerts: alerts.map(a => a.title),
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});