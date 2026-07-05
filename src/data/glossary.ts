export const glossary: Record<string, string> = {
  ipam: "Amazon VPC IP Address Manager — hosts the pool hierarchy in the network account; workloads allocate VPC CIDRs from RAM-shared leaf pools.",
  "network-account":
    "Delegated IPAM admin account — owns IPAM home region, pool tree, and RAM resource shares.",
  "management-account":
    "AWS Organizations management account — runs org-bootstrap for delegation and RAM org sharing only; cannot host IPAM.",
  "ram-share":
    "AWS Resource Access Manager permission for a workload account to use an IPAM pool — does not create a formal allocation by itself.",
  allocation:
    "Formal CIDR assignment from a pool to a VPC when the workload uses ipv4_ipam_pool_id — visible under Planning → Pools → Allocations.",
  "planning-plane":
    "IPAM console areas driven by ipam/ and workload allocations: IPAMs, Scopes, Pools, Allocations.",
  "monitoring-plane":
    "Org-wide resource discovery: Dashboard, Resources, ENIs — not filtered by pools in ipam/main.tf.",
  "pool-hierarchy":
    "Three-level CIDR tree: org → org/nz|org/au → org/nz/dev|org/au/sandbox with regional locales.",
  locale:
    "Region constraint on a pool — root org pool has no locale; regional and leaf pools set ap-southeast-6 or ap-southeast-2.",
  "stack-contract":
    "Manual copy of nz_dev_pool_id and au_sandbox_pool_id into workload terraform.tfvars as pool_id — no terraform_remote_state.",
  terraform:
    "HashiCorp Terraform — four account stacks in examples/multi-account/ plus shared modules/ipam-vpc/.",
  "upstream-example":
    "tfstack/terraform-aws-ipam examples/multi-account/ — where you run terraform apply.",
};
