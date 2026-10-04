"""
retention_strategy.py
Actionable Business Retention Strategy and Tiered Intervention Logic.
Translates model-predicted churn probabilities into cost-effective, high-ROI retention offers.
"""

import os
import json

REPORTS_DIR = "reports"
RETENTION_MATRIX_PATH = os.path.join(REPORTS_DIR, "retention_matrix.json")


def get_risk_tier(probability: float) -> str:
    """
    Categorizes continuous churn probability into business risk tiers.
      - High Risk: >= 60% (Urgent action needed; high probability of leaving)
      - Medium Risk: 30% to 59.9% (Proactive intervention to stabilize account)
      - Low Risk: < 30% (Organic nurture; avoid costly/unnecessary discount outreach)
    """
    if probability >= 0.60:
        return "HIGH"
    elif probability >= 0.30:
        return "MEDIUM"
    else:
        return "LOW"


def recommend_retention_plan(customer_data: dict, churn_probability: float) -> dict:
    """
    Generates tailored, cost-effective retention recommendations based on the customer's
    churn probability and their specific pain points (contract, add-ons, payment method).
    """
    risk_tier = get_risk_tier(churn_probability)
    monthly_charges = float(customer_data.get("MonthlyCharges", 65.0))
    contract = str(customer_data.get("Contract", "Month-to-month"))
    tech_support = str(customer_data.get("TechSupport", "No"))
    online_security = str(customer_data.get("OnlineSecurity", "No"))
    payment_method = str(customer_data.get("PaymentMethod", "Electronic check"))
    is_auto_pay = "automatic" in payment_method.lower()

    annual_revenue = round(monthly_charges * 12, 2)

    if risk_tier == "HIGH":
        urgency = "Immediate Intervention (Within 48 Hours)"
        if contract == "Month-to-month":
            primary_offer = "Contract Upgrade Incentive: 15% Monthly Discount for 1-Year Commitment"
            estimated_cost = round(monthly_charges * 12 * 0.15, 2)
            rationale = "Month-to-month contracts have the highest churn hazard (Gain: 441.5). Securing a 1-year contract locks in customer lifetime value."
        else:
            primary_offer = "Service Credit & VIP Retention Concierge: $20/month bill reduction for 3 months"
            estimated_cost = 60.0
            rationale = "Customer is experiencing dissatisfaction despite longer contract; proactive financial relief prevents contract cancellation."

        action_steps = [
            "Trigger automated priority outreach by Customer Success specialist.",
            f"Present primary offer: '{primary_offer}'.",
            "Offer complimentary setup of Automatic Billing to eliminate invoice friction.",
        ]
        expected_roi = f"Saves ~${annual_revenue - estimated_cost:.2f} net annual revenue if retained."

    elif risk_tier == "MEDIUM":
        urgency = "Proactive Nurture (Within 14 Days)"
        add_on_needed = []
        if tech_support != "Yes":
            add_on_needed.append("Tech Support")
        if online_security != "Yes":
            add_on_needed.append("Online Security")

        if add_on_needed:
            services_str = " and ".join(add_on_needed)
            primary_offer = f"Complimentary 6-Month Premium Add-on Bundle: Free {services_str}"
            estimated_cost = 25.0
            rationale = f"Missing digital support services ({services_str}) strongly correlates with churn. Free trial creates sticky usage habits."
        elif not is_auto_pay:
            primary_offer = "Auto-Pay Bonus: $5 Monthly Bill Credit upon enrolling in Automatic Bank/Card Payment"
            estimated_cost = 60.0
            rationale = "Electronic/mailed checks have higher churn rates. Autopay significantly increases customer retention."
        else:
            primary_offer = "Loyalty Speed Bump: Free 20% Internet Bandwidth upgrade for 6 months"
            estimated_cost = 15.0
            rationale = "Value-add service perk enhances perceived value without requiring cash margin discount."

        action_steps = [
            "Send targeted digital in-app/email campaign.",
            f"Offer: '{primary_offer}'.",
            "Follow-up satisfaction survey at 30 days.",
        ]
        expected_roi = f"High ROI: low intervention cost (${estimated_cost:.2f}) protects ${annual_revenue:.2f} annual contract."

    else:  # LOW RISK
        urgency = "Organic Relationship (Standard Cadence)"
        primary_offer = "Standard Loyalty Appreciation: Annual Anniversary Rewards & Device Upgrade Eligibility"
        estimated_cost = 0.0
        rationale = "Low churn probability (< 30%). Contacting these customers with discounts wastes budget and margin."
        action_steps = [
            "Do NOT contact with costly discounts or promo calls.",
            "Include in regular automated product newsletters and milestone thank-you notes.",
            "Maintain service quality and automated billing.",
        ]
        expected_roi = f"Maximum Cost-Efficiency: $0.00 promotional budget spent, preserving 100% of ${annual_revenue:.2f} revenue."

    return {
        "risk_tier": risk_tier,
        "churn_probability_pct": round(churn_probability * 100, 2),
        "urgency": urgency,
        "annual_revenue_at_risk": annual_revenue,
        "primary_retention_offer": primary_offer,
        "estimated_intervention_cost": estimated_cost,
        "strategic_rationale": rationale,
        "action_steps": action_steps,
        "expected_roi": expected_roi,
    }


def export_retention_matrix():
    """
    Exports the global tiered retention framework to reports/retention_matrix.json.
    """
    os.makedirs(REPORTS_DIR, exist_ok=True)
    matrix = {
        "framework_title": "Telecom Customer Retention Decision Matrix",
        "tiers": {
            "HIGH_RISK": {
                "threshold": "Churn Probability >= 60%",
                "target_profile": "Month-to-month contracts, fiber optic without tech support, high bills, manual checks",
                "recommended_interventions": [
                    "Contract upgrade incentive: 15% discount for 12-month agreement",
                    "3-month rate freeze & VIP priority technical support routing",
                    "Direct retention specialist phone consultation",
                ],
                "financial_objective": "Protect high customer lifetime value (LTV) against replacement costs",
            },
            "MEDIUM_RISK": {
                "threshold": "30% <= Churn Probability < 60%",
                "target_profile": "Moderate tenure, missing digital security/support services, un-enrolled in autopay",
                "recommended_interventions": [
                    "Complimentary 6-month TechSupport and OnlineSecurity add-on trial",
                    "$5/month billing credit for switching to Automatic Payment",
                    "Complimentary temporary bandwidth speed boost",
                ],
                "financial_objective": "Increase service stickiness with low-cost digital value-adds",
            },
            "LOW_RISK": {
                "threshold": "Churn Probability < 30%",
                "target_profile": "Long-tenure accounts, 1-2 year contracts, family bundles, autopay users",
                "recommended_interventions": [
                    "Automated anniversary thank-you rewards",
                    "Standard digital newsletters and device upgrade announcements",
                    "Strict exclusion from expensive promotional discount campaigns",
                ],
                "financial_objective": "Eliminate wasteful outreach spending; preserve margin",
            },
        },
    }
    with open(RETENTION_MATRIX_PATH, "w") as f:
        json.dump(matrix, f, indent=2)

    print(f"Retention strategy matrix exported to {RETENTION_MATRIX_PATH}")
    return matrix


if __name__ == "__main__":
    export_retention_matrix()
