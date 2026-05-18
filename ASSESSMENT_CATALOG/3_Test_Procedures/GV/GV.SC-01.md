# GV.SC-01: Supply Chain Risk Management Program Test Procedures

**CSF Subcategory:** GV.SC-01 - A cybersecurity supply chain risk management program, strategy, objectives, policies, and processes are established and agreed to by organizational stakeholders

---

## Test Procedures

1. **Review SCRM program documentation**
   - Request cybersecurity supply chain risk management (C-SCRM) strategy document
   - Verify program includes objectives, milestones, and resource allocation
   - Confirm policies and procedures are documented for supply chain risk management
   - Check for cross-organizational alignment mechanisms

2. **Validate program maturity against objectives**
   - Review program plan milestones and current progress
   - Verify 60% Tier 1 vendor assessment target and actual completion rate
   - Confirm ServiceNow is configured to support C-SCRM processes

3. **Examine stakeholder agreement**
   - Verify C-SCRM strategy is approved by CISO and relevant leadership
   - Check that procurement, legal, and engineering understand their C-SCRM roles
   - Confirm cross-functional coordination mechanisms are operational

4. **Walkthrough of C-SCRM execution in ServiceNow**
   - Ask Gerry to navigate to the C-SCRM module and demonstrate how a vendor assessment is initiated, tracked, and closed
   - Observe whether the workflow enforces approval gates and captures evidence at each stage
   - Confirm escalation path for vendors that fail assessment criteria
   - Document any manual workarounds that bypass the configured workflow (Completeness + Recurrence assertions)

5. **Compute vendor coverage KPIs from ServiceNow data**
   - Export all Tier 1 vendors from the full vendor register (not a filtered view)
   - Cross-reference against completed assessments to calculate actual coverage rate (target: 60%+)
   - Calculate average time to complete a vendor assessment (KPI)
   - Identify vendors with assessments overdue for renewal (KRI: % overdue)
   - Flag any Tier 1 vendors not in the assessment queue with no documented exception (Completeness assertion)
   - Verify assessments are recurring on a defined schedule, not a one-time initial batch (Recurrence assertion)

## Evidence Requests

- [ ] C-SCRM strategy and program plan
- [ ] Full Tier 1 vendor register (unfiltered)
- [ ] ServiceNow C-SCRM module configuration
- [ ] ServiceNow export of all C-SCRM assessment records (open + closed)
- [ ] Assessment cadence/schedule documentation
- [ ] Stakeholder approval documentation
- [ ] Program milestone tracking

## Notes

Alma initiated the vendor questionnaire program in Q4 2025 and has achieved 60% Tier 1 vendor assessment coverage. Assessment should evaluate whether the program has matured beyond initial implementation to a sustainable operating model. Step 4 replaces a prior inquiry-only interview step: per 15.6 ERA audit principles, inquiry alone is weak standalone evidence. A walkthrough (inquiry + observation) of the live ServiceNow workflow provides corroborating evidence. Step 5 adds analytical procedures to compute vendor coverage as a KPI rather than accepting a stated percentage at face value. The Completeness assertion requires verifying coverage against the full vendor register, not just the assessed subset.
