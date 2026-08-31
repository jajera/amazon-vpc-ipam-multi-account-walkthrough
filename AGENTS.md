# Agent notes

## Repos

| Repo                                               | Role                                               |
| -------------------------------------------------- | -------------------------------------------------- |
| `jajera/amazon-vpc-ipam-multi-account-walkthrough` | This docs site (GitHub Pages)                      |
| `tfstack/terraform-aws-ipam`                       | Source Terraform module this walkthrough documents |

Do not invent AWS account IDs, pool CIDRs, or custom domains for the lab. Use placeholder values from the demo only.

## Docs source of truth

Walkthrough steps live in `src/content/docs/**/*.mdx`. Keep sidebar slugs in `astro.config.mjs` aligned with those files.

## Site URL

Production docs: `https://amazon-vpc-ipam-multi-account-walkthrough.johna.kiwi` (Pages + Route 53 CNAME via johna-kiwi-infra `sites.yaml`).
