# amazon-vpc-ipam-multi-account-walkthrough

Step-by-step documentation site for deploying the [tfstack/terraform-aws-ipam](https://github.com/tfstack/terraform-aws-ipam) `examples/multi-account/` demo — four-account AWS VPC IPAM with regional pools, RAM sharing, and pool-backed workload VPCs.

Published at [jajera.github.io/amazon-vpc-ipam-multi-account-walkthrough](https://jajera.github.io/amazon-vpc-ipam-multi-account-walkthrough/).

## What this is / What this is not

| This repository                                       | Source demo repository                                                    |
| ----------------------------------------------------- | ------------------------------------------------------------------------- |
| Walkthrough documentation site (Astro + Starlight)    | Terraform implementation (`examples/multi-account/`, `modules/ipam-vpc/`) |
| Explains architecture, phases, verification, teardown | Where you run `terraform apply`                                           |
| Tracks upstream `main` branch                         | Owns infrastructure state                                                 |

**Run all Terraform commands from the [upstream module repo](https://github.com/tfstack/terraform-aws-ipam/tree/main/examples/multi-account/)**, not from this walkthrough repo.

## Local development

```bash
npm install
npm run dev
```

## Validation

```bash
npm run validate   # prettier + markdownlint
npm run build      # astro build (also npm test)
```

## About

Four-account AWS VPC IPAM with ANZ regional pools — delegated network admin, RAM org sharing, cross-region locales, and pool-backed VPCs. No Transit Gateway, NAT gateway, or management-account IPAM hosting.
