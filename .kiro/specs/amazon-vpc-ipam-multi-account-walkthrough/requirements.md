# Requirements Document

## Introduction

A documentation-only static site that teaches platform engineers how to deploy and operate the IPAM multi-account Terraform example from [`tfstack/terraform-aws-ipam`](https://github.com/tfstack/terraform-aws-ipam) (`examples/multi-account/`). The site covers a four-account, multi-region AWS Organizations IPAM deployment using an ANZ regional pattern (NZ primary `ap-southeast-6`, AU secondary `ap-southeast-2`).

Canonical source material for walkthrough content lives in the upstream module repository at `.kiro/specs/multi-account-example/WALKTHROUGH.md`. Empirical apply errors belong in upstream `examples/multi-account/FINDINGS.md` — the Site SHALL cross-link rather than duplicate FINDINGS as design rationale.

Built with Astro/Starlight and deployed to GitHub Pages. Content SHALL be operational reference (no presenter script, demo narration, or “say this aloud” language).

## Glossary

- **Site**: The Astro/Starlight static documentation site deployed to GitHub Pages
- **Walkthrough**: The phase-driven operational guide covering prerequisites, apply, verify, and destroy sequences
- **Architecture_Section**: Content explaining system design, pool hierarchy, account topology, and IPAM console layout
- **Reference_Section**: Glossary, decision log, FAQ, AWS doc links, and troubleshooting
- **Page**: A single-purpose documentation page within the Site addressing one topic
- **Callout**: A visually distinct block (tip, caution, danger) used to highlight safety-critical or important information
- **Source_Version_Declaration**: A frontmatter or page element that pins documentation to a specific release or commit of the upstream Terraform module
- **Upstream_Example**: `tfstack/terraform-aws-ipam/examples/multi-account/` — four Terraform roots plus shared `modules/ipam-vpc/`
- **IPAM**: AWS VPC IP Address Manager in the network (delegated admin) account
- **Pool_Hierarchy**: Three-level CIDR tree: `org` → `org/nz`|`org/au` → `org/nz/dev`|`org/au/sandbox`
- **Stack**: One of four Terraform roots: `org-bootstrap/`, `ipam/`, `workload-a/`, `workload-b/`
- **IPAM_VPC_Module**: Shared module at `modules/ipam-vpc/` — pool-backed VPC via `ipv4_ipam_pool_id` + `ipv4_netmask_length`
- **Stack_Contract**: Manual copy of `nz_dev_pool_id` / `au_sandbox_pool_id` into workload `terraform.tfvars` as `pool_id` — no remote state
- **Planning_Plane**: IPAM console areas driven by `ipam/` and workload allocations (IPAMs, Scopes, Pools, Allocations)
- **Monitoring_Plane**: Org-wide resource discovery (Dashboard, Resources, ENIs) — not filtered by pool config in `ipam/main.tf`
- **RAM_Share**: Permission for a workload account to use an IPAM pool (`org-nz-dev`, `org-au-sandbox` resource share names)
- **Allocation**: Formal pool→VPC CIDR assignment (visible under Planning → Pools → Allocations when VPC uses `ipv4_ipam_pool_id`)
- **CIDR_Plan**: Documented mapping of pool paths and VPC `/20` blocks to CIDR and locale
- **Build_Pipeline**: GitHub Actions workflow that validates, builds, and deploys the Site
- **Mermaid_Diagram**: Code-based diagram rendered at build time

## Requirements

### Requirement 1: Static Site Framework

**User Story:** As a contributor, I want the documentation site built with Astro/Starlight, so that content is maintainable as Markdown and deployable as a static site to GitHub Pages.

#### Acceptance Criteria

1. THE Site SHALL use Astro with the Starlight documentation theme as the static site generator
2. THE Site SHALL produce a static HTML build deployable to GitHub Pages without a server runtime
3. THE Site SHALL render all content pages from Markdown or MDX source files
4. THE Site SHALL declare the upstream Terraform module version or git ref in a Source_Version_Declaration visible on the landing page
5. THE Site SHALL link to the upstream example path (`examples/multi-account/`) and module registry source on every apply-related page

### Requirement 2: Content Structure

**User Story:** As a platform engineer, I want documentation organized into distinct content domains with single-purpose pages, so that I can navigate directly to the topic I need.

#### Acceptance Criteria

1. THE Site SHALL organize content into at least three top-level domains: Walkthrough, Architecture_Section, and Reference_Section
2. THE Site SHALL present each major topic as a separate Page, including at minimum:
   - Overview and success criteria
   - Prerequisites and pre-flight checks (SSO, profiles, `aws sts get-caller-identity`)
   - IPAM delegation and org-bootstrap
   - Pool hierarchy and CIDR plan
   - RAM sharing and workload onboarding (RAM vs allocation vs discovery)
   - Planning vs Monitoring (two-plane model and IPAM console map)
   - Apply order and stack contract
   - Verification (Allocations, Managed VPCs, Resources → ENIs, dashboard caveats)
   - Teardown order
   - Troubleshooting and FAQ
3. THE Site SHALL provide sidebar navigation that groups pages by content domain
4. THE Site SHALL include a landing page summarizing purpose, audience, prerequisites, and the four-account topology
5. THE Site SHALL NOT use presenter script, demo narration, or imperative “say aloud” phrasing

### Requirement 3: Architecture Documentation

**User Story:** As a platform engineer learning multi-account IPAM patterns, I want clear architecture documentation with diagrams, so that I understand the system design before running the deployment.

#### Acceptance Criteria

1. THE Architecture_Section SHALL include a Mermaid_Diagram showing the four-account topology (Management, Network, Dev, Sandbox) and RAM relationships
2. THE Architecture_Section SHALL include a Mermaid_Diagram showing the three-level Pool_Hierarchy with CIDR allocations and locale assignments (`org` without locale; regional pools with `ap-southeast-6` / `ap-southeast-2`)
3. THE Architecture_Section SHALL document the CIDR_Plan table: pool paths, VPC `/20` allocations, and demo host `.5` addresses
4. THE Architecture_Section SHALL explain that the management account cannot host IPAM and that a dedicated network member account is the delegated admin
5. THE Architecture_Section SHALL explain the RAM sharing model: `ram_share_principals` on leaf pools, resource share names (`org-nz-dev`, `org-au-sandbox`), and RAM console verification paths
6. THE Architecture_Section SHALL explain the distinction between:
   - **RAM share** — permission to use a pool
   - **IPAM allocation** — formal pool→VPC CIDR when workload uses `ipv4_ipam_pool_id` (Managed VPC)
   - **Org resource discovery** — Monitoring inventory across all member accounts (not limited to RAM-shared pools)
7. THE Architecture_Section SHALL document Planning vs Monitoring as separate planes, including an IPAM console map diagram (Planning: IPAMs, Scopes, Pools, Resource discoveries; Monitoring: Dashboard, Resources)
8. THE Architecture_Section SHALL document Private vs Public IPAM scopes (Private used; Public empty by design)
9. THE Architecture_Section SHALL document workload VPC creation via **IPAM_VPC_Module** (`ipv4_ipam_pool_id`, `ipv4_netmask_length = 20`) and note that preview + static CIDR is a superseded pattern

### Requirement 4: Walkthrough Apply Phase

**User Story:** As a platform engineer running the IPAM demo, I want a phase-driven guide for applying stacks in the correct order, so that I can deploy the full environment without errors.

#### Acceptance Criteria

1. THE Walkthrough SHALL document apply order: `org-bootstrap/` first, then `ipam/`, then `workload-a/` and `workload-b/` (parallel OK)
2. THE Walkthrough SHALL specify AWS account, profile (`ipam-org`, `ipam-network`, `ipam-workload-a`, `ipam-workload-b`), and region for each Stack
3. THE Walkthrough SHALL document the Stack_Contract: copy `nz_dev_pool_id` and `au_sandbox_pool_id` from `ipam/` outputs into gitignored workload `terraform.tfvars` as `pool_id` — no `terraform_remote_state`
4. THE Walkthrough SHALL document pre-flight: SSO login, successful `aws sts get-caller-identity` per profile before any `terraform apply`
5. WHEN a command modifies AWS Organizations or delegates administration, THE Page SHALL display a danger Callout
6. WHEN a command requires a specific IAM role or account credential switch, THE Page SHALL display a caution Callout
7. THE Walkthrough SHALL state that `enable_ram_sharing_with_organization` runs only in `org-bootstrap/` (management account), not in `ipam/`

### Requirement 5: Walkthrough Verification Phase

**User Story:** As a platform engineer, I want verification steps after deployment, so that I can confirm IPAM pools, allocations, and VPCs are provisioned correctly.

#### Acceptance Criteria

1. THE Walkthrough SHALL include verification for leaf pools `org/nz/dev` and `org/au/sandbox`: expected CIDRs, locales, and RAM resource shares
2. THE Walkthrough SHALL include verification that workload VPCs are **Managed** with `/20` CIDRs from the correct pools
3. THE Walkthrough SHALL include verification under Planning → Pools → **Allocations** (formal pool→VPC blocks, owner = workload account)
4. THE Walkthrough SHALL include verification under Monitoring → Resources → subnet → **ENIs** for demo host IPs (`10.64.0.5`, `10.128.0.5`) — not under Allocations
5. THE Walkthrough SHALL explain that Monitoring → Dashboard is org-wide, may lag Allocations by hours, and includes legacy/unmanaged VPCs outside this example
6. THE Walkthrough SHALL explain leaf pool utilization: **0% Allocated** with **~3% Assigned** is normal for a single `/20` from a `/16` leaf pool
7. THE Walkthrough SHALL provide example CLI commands (`terraform output`) and console navigation paths for each verification step

### Requirement 6: Walkthrough Destroy Phase

**User Story:** As a platform engineer, I want a teardown guide with the correct destroy order, so that I can cleanly remove demo resources without orphaned dependencies.

#### Acceptance Criteria

1. THE Walkthrough SHALL document destroy order: `workload-a/` and `workload-b/` first, then `ipam/`, then optionally `org-bootstrap/`
2. THE Walkthrough SHALL note that keeping `org-bootstrap/` in place is common for iterative testing
3. THE Walkthrough SHALL specify AWS profile and region context for each destroy operation
4. WHEN a destroy step has timing dependencies (pool allocations must be removed first), THE Page SHALL display a caution Callout

### Requirement 7: Troubleshooting and FAQ Reference

**User Story:** As a platform engineer encountering errors during the demo, I want troubleshooting and FAQ pages, so that I can resolve issues without external support.

#### Acceptance Criteria

1. THE Reference_Section SHALL include a troubleshooting Page covering at minimum:

   | Symptom                                             | Documented cause and recovery                                                |
   | --------------------------------------------------- | ---------------------------------------------------------------------------- |
   | `AccessDeniedException from AWSOrganizations`       | RAM org ops from member account — use management `org-bootstrap/`            |
   | `InvalidParameterCombination` (pool locale)         | Parent locale on `org` pool — omit locale on root; set on regional/leaf only |
   | `IpamOrganizationDelegatedAdminCannotBeRootAccount` | IPAM in management account — use network member delegation                   |
   | No pool allocation after workload apply             | VPC not using `ipv4_ipam_pool_id` — re-apply with IPAM_VPC_Module pattern    |
   | Dashboard mostly Unmanaged after redeploy           | Org-wide discovery lag and legacy VPCs — check Allocations; filter Resources |
   | `.5` not in pool Allocations                        | Expected — host IP is ENI-level; check Resources → ENIs                      |
   | `No valid credential sources found`                 | SSO expired or wrong profile — re-login and verify permission set            |

2. WHEN documenting an error, THE Page SHALL include error message text, root cause, and corrective action
3. THE Reference_Section SHALL include an FAQ Page covering trade-offs documented upstream (home region choice, dedicated network account, NAT disabled, Public scope empty, RAM vs allocation vs monitoring scope, dashboard sync timing)
4. THE Reference_Section SHALL include a glossary Page aligned with upstream WALKTHROUGH terminology
5. THE Reference_Section SHALL include a decision log Page (or table) summarizing key design choices and verification pointers
6. THE Site SHALL link to upstream FINDINGS.md for empirical apply notes rather than copying them into Architecture_Section

### Requirement 8: Safety Callout System

**User Story:** As a platform engineer running commands against production-like accounts, I want clear visual warnings before risky operations, so that I do not accidentally perform destructive or irreversible actions.

#### Acceptance Criteria

1. THE Site SHALL use a danger-level Callout for commands that are irreversible or affect AWS Organizations-level configuration (delegation, RAM org sharing)
2. THE Site SHALL use a caution-level Callout for credential context switches, SSO pre-checks, destroy ordering, and dashboard sync lag
3. THE Site SHALL use a tip-level Callout for optional best practices (keeping org-bootstrap, filtering Resources by account)
4. THE Site SHALL render Callouts as visually distinct blocks with icon and colored border by severity

### Requirement 9: Sensitive Data and Examples

**User Story:** As a contributor publishing public documentation, I want no real account or resource identifiers in the Site, so that the repository is safe to share.

#### Acceptance Criteria

1. THE Site SHALL NOT commit or render real 12-digit AWS account IDs, organization IDs, or live `ipam-pool-*` / `ipam-*` resource IDs from applies
2. THE Site SHALL use placeholders in all copy-paste examples (`111111111111`, `ipam-pool-0123456789abcdef0`, example profiles)
3. THE Walkthrough SHALL instruct operators to store real values in gitignored `terraform.tfvars` locally (matching upstream `.gitignore`)

### Requirement 10: CI/CD Build and Deploy Pipeline

**User Story:** As a contributor, I want automated validation, build, and deployment workflows, so that documentation changes are tested and published without manual intervention.

#### Acceptance Criteria

1. THE Build_Pipeline SHALL validate Markdown and MDX for syntax and internal link integrity on every pull request
2. THE Build_Pipeline SHALL build the Astro site and fail if the build produces errors
3. THE Build_Pipeline SHALL deploy the built site to GitHub Pages on merge to the main branch
4. THE Build_Pipeline SHALL be defined as GitHub Actions workflow files in the repository

### Requirement 11: Mermaid Diagram Rendering

**User Story:** As a contributor, I want architecture diagrams authored as Mermaid code blocks in Markdown, so that diagrams are version-controlled and rendered automatically at build time.

#### Acceptance Criteria

1. THE Site SHALL render Mermaid code blocks in Markdown files as diagrams in the built output
2. THE Site SHALL support at least flowchart/graph types for account topology, pool hierarchy, and IPAM console map
3. IF a Mermaid code block contains invalid syntax, THEN THE Build_Pipeline SHALL fail with a descriptive error message

### Requirement 12: Content Fidelity to Upstream Example

**User Story:** As a maintainer, I want the Site to stay aligned with the Terraform example, so that operators following the walkthrough get accurate commands and expectations.

#### Acceptance Criteria

1. WHEN the upstream `examples/multi-account/` example changes (pool paths, outputs, module layout, apply order), THE Site SHALL be updated in the same release cycle or Source_Version_Declaration SHALL pin an explicit older ref
2. THE Site SHALL document non-goals matching upstream: no TGW, peering, VPN, Direct Connect; NAT disabled; demo `t3.nano` with subnet `/32` reservation at `.5`
3. THE Site SHALL document success criteria matching upstream: Managed VPCs, Allocations visible, ENIs visible at expected host IPs, RAM shares present
