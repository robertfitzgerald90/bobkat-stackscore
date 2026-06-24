# BobKat StackScore - Database Schema

## Purpose

This document defines the initial database structure for BobKat StackScore.

BobKat StackScore is designed to assess small business technology environments, calculate health and risk scores, generate recommendations, and track improvement over time.

The database should support:

* Multiple clients
* Multiple assessments per client
* Category-based scoring
* Question and answer tracking
* Recommendation generation
* Project tracking
* Historical score improvement
* Future client portal functionality

---

# Core Database Concepts

The application is built around the following flow:

Client
→ Assessment
→ Assessment Responses
→ Scores
→ Recommendations
→ Projects
→ Improved Future Assessments

---

# 1. Users

Stores application users who can log in and manage client assessments.

## Purpose

Users may include BobKat IT admins, technicians, assessors, or future client portal users.

## Fields

| Field        | Type     | Notes                      |
| ------------ | -------- | -------------------------- |
| id           | UUID     | Primary key                |
| name         | String   | User's full name           |
| email        | String   | Unique login email         |
| passwordHash | String   | Hashed password only       |
| role         | Enum     | admin, technician, client  |
| isActive     | Boolean  | Enables or disables access |
| createdAt    | DateTime | Record creation date       |
| updatedAt    | DateTime | Last updated date          |

## Relationships

* One user can create many assessments.
* One user can create many recommendations.
* One user can be assigned to many projects.

---

# 2. Clients

Stores businesses being assessed or managed.

## Purpose

Each client represents a business environment tracked inside StackScore.

## Fields

| Field               | Type     | Notes                         |
| ------------------- | -------- | ----------------------------- |
| id                  | UUID     | Primary key                   |
| companyName         | String   | Client business name          |
| primaryContactName  | String   | Main contact                  |
| primaryContactEmail | String   | Main contact email            |
| primaryContactPhone | String   | Main contact phone            |
| industry            | String   | Business industry             |
| employeeCount       | Integer  | Number of employees           |
| deviceCount         | Integer  | Approximate number of devices |
| locationCity        | String   | City                          |
| locationState       | String   | State                         |
| status              | Enum     | prospect, active, inactive    |
| notes               | Text     | General client notes          |
| createdAt           | DateTime | Record creation date          |
| updatedAt           | DateTime | Last updated date             |

## Relationships

* One client can have many assessments.
* One client can have many projects.
* One client can have many documents in the future.

---

# 3. Assessment Categories

Stores the main scoring categories.

## Purpose

Categories allow questions and scores to be grouped into business-friendly areas.

## Initial Categories

| Category                                | Max Points |
| --------------------------------------- | ---------: |
| Security & Protection                   |         20 |
| Backup & Recovery                       |         20 |
| Infrastructure & Network Health         |         15 |
| Endpoint & Asset Management             |         15 |
| Documentation & Operational Readiness   |         10 |
| Business Continuity & Disaster Recovery |         10 |
| Strategic Technology Management         |         10 |

## Fields

| Field        | Type     | Notes                        |
| ------------ | -------- | ---------------------------- |
| id           | UUID     | Primary key                  |
| name         | String   | Category name                |
| description  | Text     | Category description         |
| maxPoints    | Integer  | Maximum available points     |
| displayOrder | Integer  | Controls display order       |
| isActive     | Boolean  | Enables or disables category |
| createdAt    | DateTime | Record creation date         |
| updatedAt    | DateTime | Last updated date            |

## Relationships

* One category can have many questions.
* One category can have many recommendations.
* One category can have many score records.

---

# 4. Assessment Questions

Stores reusable assessment questions.

## Purpose

Questions are the foundation of the scoring engine.

Each question belongs to a category and has predefined answer options with scoring values.

## Fields

| Field        | Type     | Notes                                      |
| ------------ | -------- | ------------------------------------------ |
| id           | UUID     | Primary key                                |
| categoryId   | UUID     | Foreign key to Assessment Categories       |
| questionText | Text     | The assessment question                    |
| helpText     | Text     | Optional explanation for the assessor      |
| weight       | Integer  | Maximum points available for this question |
| displayOrder | Integer  | Controls question order                    |
| riskLevel    | Enum     | low, medium, high, critical                |
| isActive     | Boolean  | Enables or disables question               |
| createdAt    | DateTime | Record creation date                       |
| updatedAt    | DateTime | Last updated date                          |

## Relationships

* One question belongs to one category.
* One question can have many answer options.
* One question can have many assessment responses.

---

# 5. Answer Options

Stores the available answers for each question.

## Purpose

Answer options allow consistent scoring across assessments.

## Example

Question:

Is MFA enabled for all Microsoft 365 users?

| Answer  | Score |
| ------- | ----: |
| Yes     |     5 |
| Partial |     2 |
| No      |     0 |

## Fields

| Field                    | Type     | Notes                                               |
| ------------------------ | -------- | --------------------------------------------------- |
| id                       | UUID     | Primary key                                         |
| questionId               | UUID     | Foreign key to Assessment Questions                 |
| answerText               | String   | Displayed answer option                             |
| scoreValue               | Integer  | Points awarded                                      |
| displayOrder             | Integer  | Controls answer order                               |
| triggersRecommendation   | Boolean  | Whether this answer should trigger a recommendation |
| recommendationTemplateId | UUID     | Optional link to recommendation template            |
| createdAt                | DateTime | Record creation date                                |
| updatedAt                | DateTime | Last updated date                                   |

## Relationships

* One answer option belongs to one question.
* One answer option can trigger one recommendation template.

---

# 6. Assessments

Stores each assessment performed for a client.

## Purpose

A client can have multiple assessments over time.

This allows StackScore to show improvement from onboarding through the ongoing client relationship.

## Fields

| Field               | Type     | Notes                                  |
| ------------------- | -------- | -------------------------------------- |
| id                  | UUID     | Primary key                            |
| clientId            | UUID     | Foreign key to Clients                 |
| assessorUserId      | UUID     | Foreign key to Users                   |
| assessmentName      | String   | Example: Initial Assessment, Q1 Review |
| assessmentType      | Enum     | initial, quarterly, annual, followup   |
| status              | Enum     | draft, completed, archived             |
| assessmentDate      | DateTime | Date assessment was performed          |
| overallScore        | Decimal  | Final calculated score                 |
| securityScore       | Decimal  | Security category score                |
| backupScore         | Decimal  | Backup category score                  |
| infrastructureScore | Decimal  | Infrastructure category score          |
| endpointScore       | Decimal  | Endpoint category score                |
| documentationScore  | Decimal  | Documentation category score           |
| bcdrScore           | Decimal  | Business continuity category score     |
| strategicScore      | Decimal  | Strategic category score               |
| executiveSummary    | Text     | Summary for report output              |
| internalNotes       | Text     | Notes for BobKat IT only               |
| createdAt           | DateTime | Record creation date                   |
| updatedAt           | DateTime | Last updated date                      |
| completedAt         | DateTime | Completion date                        |

## Relationships

* One assessment belongs to one client.
* One assessment has many responses.
* One assessment has many category scores.
* One assessment has many recommendations.

---

# 7. Assessment Responses

Stores answers provided during an assessment.

## Purpose

This table captures the actual assessment findings.

Each response links an assessment to a question and selected answer.

## Fields

| Field                  | Type     | Notes                                  |
| ---------------------- | -------- | -------------------------------------- |
| id                     | UUID     | Primary key                            |
| assessmentId           | UUID     | Foreign key to Assessments             |
| questionId             | UUID     | Foreign key to Assessment Questions    |
| selectedAnswerOptionId | UUID     | Foreign key to Answer Options          |
| scoreEarned            | Integer  | Points earned from selected answer     |
| notes                  | Text     | Assessor notes                         |
| evidence               | Text     | Optional evidence or supporting detail |
| createdAt              | DateTime | Record creation date                   |
| updatedAt              | DateTime | Last updated date                      |

## Relationships

* One response belongs to one assessment.
* One response belongs to one question.
* One response uses one selected answer option.

---

# 8. Assessment Category Scores

Stores calculated scores by category for each assessment.

## Purpose

This table supports dashboards, trend charts, and historical improvement tracking.

## Fields

| Field          | Type     | Notes                                          |
| -------------- | -------- | ---------------------------------------------- |
| id             | UUID     | Primary key                                    |
| assessmentId   | UUID     | Foreign key to Assessments                     |
| categoryId     | UUID     | Foreign key to Assessment Categories           |
| pointsEarned   | Decimal  | Points earned in category                      |
| pointsPossible | Decimal  | Points possible in category                    |
| percentScore   | Decimal  | Category percentage                            |
| rating         | Enum     | exceptional, strong, stable, at_risk, critical |
| createdAt      | DateTime | Record creation date                           |
| updatedAt      | DateTime | Last updated date                              |

## Relationships

* One category score belongs to one assessment.
* One category score belongs to one category.

---

# 9. Recommendation Templates

Stores reusable recommendation rules.

## Purpose

Templates standardize recommendations generated from risky answers.

## Example

If MFA is not enabled:

* Title: Enable Multi-Factor Authentication
* Priority: High
* Category: Security & Protection
* Business Impact: Reduces risk of account compromise.
* Suggested Service: Microsoft 365 Security Hardening

## Fields

| Field                 | Type     | Notes                                |
| --------------------- | -------- | ------------------------------------ |
| id                    | UUID     | Primary key                          |
| categoryId            | UUID     | Foreign key to Assessment Categories |
| title                 | String   | Recommendation title                 |
| description           | Text     | Recommendation explanation           |
| businessImpact        | Text     | Business-friendly risk explanation   |
| suggestedService      | String   | BobKat IT service alignment          |
| priority              | Enum     | low, medium, high, critical          |
| estimatedImpactPoints | Integer  | Expected score improvement           |
| isActive              | Boolean  | Enables or disables template         |
| createdAt             | DateTime | Record creation date                 |
| updatedAt             | DateTime | Last updated date                    |

## Relationships

* One template belongs to one category.
* One template can be triggered by many answer options.
* One template can generate many assessment recommendations.

---

# 10. Assessment Recommendations

Stores recommendations generated for a specific assessment.

## Purpose

These are the actual recommendations presented to the client.

## Fields

| Field                    | Type     | Notes                                            |
| ------------------------ | -------- | ------------------------------------------------ |
| id                       | UUID     | Primary key                                      |
| assessmentId             | UUID     | Foreign key to Assessments                       |
| clientId                 | UUID     | Foreign key to Clients                           |
| categoryId               | UUID     | Foreign key to Assessment Categories             |
| recommendationTemplateId | UUID     | Optional foreign key to Recommendation Templates |
| title                    | String   | Recommendation title                             |
| description              | Text     | Recommendation detail                            |
| businessImpact           | Text     | Business risk explanation                        |
| priority                 | Enum     | low, medium, high, critical                      |
| status                   | Enum     | open, accepted, declined, completed              |
| estimatedImpactPoints    | Integer  | Expected score improvement                       |
| createdByUserId          | UUID     | User who created/generated recommendation        |
| createdAt                | DateTime | Record creation date                             |
| updatedAt                | DateTime | Last updated date                                |
| completedAt              | DateTime | Completion date                                  |

## Relationships

* One recommendation belongs to one assessment.
* One recommendation belongs to one client.
* One recommendation may generate one project.

---

# 11. Projects

Stores improvement work performed for clients.

## Purpose

Projects connect recommendations to real-world progress.

This is what makes StackScore a living system instead of a one-time report.

## Example Projects

* Deploy Microsoft 365 MFA
* Implement Endpoint Management
* Replace Firewall
* Configure Cloud Backup
* Build Disaster Recovery Plan
* Create Network Documentation

## Fields

| Field                 | Type     | Notes                                                          |
| --------------------- | -------- | -------------------------------------------------------------- |
| id                    | UUID     | Primary key                                                    |
| clientId              | UUID     | Foreign key to Clients                                         |
| recommendationId      | UUID     | Optional foreign key to Assessment Recommendations             |
| assignedUserId        | UUID     | Optional foreign key to Users                                  |
| title                 | String   | Project title                                                  |
| description           | Text     | Project description                                            |
| status                | Enum     | proposed, approved, in_progress, completed, deferred, declined |
| priority              | Enum     | low, medium, high, critical                                    |
| categoryId            | UUID     | Related category                                               |
| estimatedImpactPoints | Integer  | Expected score improvement                                     |
| actualImpactPoints    | Integer  | Actual score improvement after completion                      |
| estimatedCost         | Decimal  | Optional budget estimate                                       |
| startDate             | DateTime | Project start date                                             |
| targetCompletionDate  | DateTime | Target completion date                                         |
| completedAt           | DateTime | Completion date                                                |
| createdAt             | DateTime | Record creation date                                           |
| updatedAt             | DateTime | Last updated date                                              |

## Relationships

* One project belongs to one client.
* One project may come from one recommendation.
* One project may be assigned to one user.
* One project belongs to one category.

---

# 12. Client Score History

Stores historical scores for client trend tracking.

## Purpose

This table allows StackScore to show progress over time without recalculating every historical assessment.

## Fields

| Field               | Type     | Notes                               |
| ------------------- | -------- | ----------------------------------- |
| id                  | UUID     | Primary key                         |
| clientId            | UUID     | Foreign key to Clients              |
| assessmentId        | UUID     | Optional foreign key to Assessments |
| recordedDate        | DateTime | Date score was recorded             |
| overallScore        | Decimal  | Overall StackScore                  |
| securityScore       | Decimal  | Security score                      |
| backupScore         | Decimal  | Backup score                        |
| infrastructureScore | Decimal  | Infrastructure score                |
| endpointScore       | Decimal  | Endpoint score                      |
| documentationScore  | Decimal  | Documentation score                 |
| bcdrScore           | Decimal  | Business continuity score           |
| strategicScore      | Decimal  | Strategic score                     |
| notes               | Text     | Optional notes                      |
| createdAt           | DateTime | Record creation date                |

## Relationships

* One client can have many score history records.
* One score history record may come from one assessment.

---

# 13. Documents

Stores files or report references.

## Purpose

This supports future PDF exports, client reports, diagrams, and onboarding documentation.

## Fields

| Field            | Type     | Notes                                                |
| ---------------- | -------- | ---------------------------------------------------- |
| id               | UUID     | Primary key                                          |
| clientId         | UUID     | Foreign key to Clients                               |
| assessmentId     | UUID     | Optional foreign key to Assessments                  |
| projectId        | UUID     | Optional foreign key to Projects                     |
| documentType     | Enum     | report, diagram, contract, proposal, evidence, other |
| title            | String   | Document title                                       |
| fileUrl          | String   | Storage location                                     |
| uploadedByUserId | UUID     | Foreign key to Users                                 |
| createdAt        | DateTime | Upload date                                          |
| updatedAt        | DateTime | Last updated date                                    |

## Relationships

* One document belongs to one client.
* A document may belong to one assessment.
* A document may belong to one project.

---

# 14. Notes / Activity Log

Stores important activity and comments.

## Purpose

Provides a timeline of client work, assessment changes, project updates, and internal notes.

## Fields

| Field        | Type     | Notes                                                |
| ------------ | -------- | ---------------------------------------------------- |
| id           | UUID     | Primary key                                          |
| clientId     | UUID     | Foreign key to Clients                               |
| assessmentId | UUID     | Optional foreign key                                 |
| projectId    | UUID     | Optional foreign key                                 |
| userId       | UUID     | User who created the note                            |
| noteType     | Enum     | general, assessment, recommendation, project, system |
| visibility   | Enum     | internal, client_visible                             |
| content      | Text     | Note content                                         |
| createdAt    | DateTime | Note creation date                                   |

## Relationships

* One note belongs to one client.
* A note may belong to an assessment.
* A note may belong to a project.
* One user can create many notes.

---

# Key Enums

## User Role

* admin
* technician
* client

## Client Status

* prospect
* active
* inactive

## Assessment Type

* initial
* quarterly
* annual
* followup

## Assessment Status

* draft
* completed
* archived

## Priority

* low
* medium
* high
* critical

## Recommendation Status

* open
* accepted
* declined
* completed

## Project Status

* proposed
* approved
* in_progress
* completed
* deferred
* declined

## Rating

* exceptional
* strong
* stable
* at_risk
* critical

## Document Type

* report
* diagram
* contract
* proposal
* evidence
* other

## Note Type

* general
* assessment
* recommendation
* project
* system

## Visibility

* internal
* client_visible

---

# Scoring Logic

## Overall Score

The overall score is calculated from category scores.

Maximum total score: 100 points.

| Category                                | Max Points |
| --------------------------------------- | ---------: |
| Security & Protection                   |         20 |
| Backup & Recovery                       |         20 |
| Infrastructure & Network Health         |         15 |
| Endpoint & Asset Management             |         15 |
| Documentation & Operational Readiness   |         10 |
| Business Continuity & Disaster Recovery |         10 |
| Strategic Technology Management         |         10 |

## Category Score

Each category score is calculated as:

```text
(points earned / points possible) x category max points
```

## Overall Rating

| Score Range | Rating      |
| ----------- | ----------- |
| 90-100      | exceptional |
| 80-89       | strong      |
| 70-79       | stable      |
| 60-69       | at_risk     |
| Below 60    | critical    |

---

# MVP Tables

For the first build, prioritize these tables:

1. Users
2. Clients
3. Assessment Categories
4. Assessment Questions
5. Answer Options
6. Assessments
7. Assessment Responses
8. Assessment Category Scores
9. Recommendation Templates
10. Assessment Recommendations
11. Projects
12. Client Score History

Documents and activity logs can be added after the core assessment and scoring workflow works.

---

# Future Enhancements

Future versions may include:

* Client portal access
* Microsoft 365 integration
* NinjaOne integration
* Ubiquiti integration
* Automated asset discovery
* PDF report exports
* Proposal generation
* Recurring quarterly business reviews
* Service agreement tracking
* Contract renewal reminders
* Warranty expiration tracking
