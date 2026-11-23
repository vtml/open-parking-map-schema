Feature: Check my car park
  An owner compares an OPMS dataset with the real place and exports a sign-off.
  The places in these scenarios are fictional.

  Scenario: Owner confirms an entrance
    Given a valid Wattle Reserve dataset
    When the owner confirms entrance "wr.ap1"
    Then entrance "wr.ap1" is confirmed

  Scenario: Owner marks an accessible bay incorrect
    Given a valid Wattle Reserve dataset
    When the operator marks accessible bay "wr.g.b13" incorrect with note "Shared zone is blocked" and evidence "photo:fictional-bay-13"
    Then bay "wr.g.b13" is incorrect with that note and evidence

  Scenario: Invalid dataset shows plain-English errors
    Given a Wattle Reserve dataset whose first bay names a missing zone
    Then a plain-English error points at that bay and mentions the zone

  Scenario: Export produces a valid review
    Given a valid Wattle Reserve dataset
    And the owner confirms entrance "wr.ap1"
    When the owner exports a review as "Fictional Reserve Office"
    Then the review names dataset "wr" and entrance "wr.ap1" as confirmed
    And the review document satisfies the review schema

  Scenario: Tier 2 cannot be claimed without owner confirmation
    Given a valid Wattle Reserve dataset
    When the facility tier is raised to 2 without an owner confirmation
    Then the tier claim is refused

  Scenario: Overlay alignment with two control points
    When the owner aligns image point 0,0 to map point 5,5 and image point 10,0 to map point 15,5
    Then image point 10,0 lands on map point 15,5
