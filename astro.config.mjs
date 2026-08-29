import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import starlightThemeVintage from "starlight-theme-vintage";
import { starlightBasePath } from "starlight-base-path";

export default defineConfig({
  site: "https://amazon-vpc-ipam-multi-account-walkthrough.johna.kiwi",
  base: "/",
  integrations: [
    starlight({
      title: "Amazon VPC IPAM Multi-Account Walkthrough",
      favicon: "/favicon.svg",
      description:
        "Step-by-step walkthrough for four-account AWS VPC IPAM with regional pools, RAM sharing, and pool-backed workload VPCs.",
      head: [
        {
          tag: "meta",
          attrs: {
            property: "og:image",
            content:
              "https://jajera.github.io/amazon-vpc-ipam-multi-account-walkthrough/og-image.png",
          },
        },
        {
          tag: "meta",
          attrs: {
            property: "og:image:width",
            content: "1200",
          },
        },
        {
          tag: "meta",
          attrs: {
            property: "og:image:height",
            content: "630",
          },
        },
        {
          tag: "meta",
          attrs: {
            name: "twitter:card",
            content: "summary_large_image",
          },
        },
        {
          tag: "meta",
          attrs: {
            name: "twitter:image",
            content:
              "https://jajera.github.io/amazon-vpc-ipam-multi-account-walkthrough/og-image.png",
          },
        },
      ],
      plugins: [starlightThemeVintage(), starlightBasePath()],
      social: [
        {
          icon: "github",
          label: "Source Repository",
          href: "https://github.com/jajera/amazon-vpc-ipam-multi-account-walkthrough",
        },
      ],
      editLink: {
        baseUrl:
          "https://github.com/jajera/amazon-vpc-ipam-multi-account-walkthrough/edit/main/",
      },
      sidebar: [
        { label: "Home", link: "/" },
        {
          label: "Introduction",
          items: [
            { label: "Overview", slug: "walkthrough/01-overview" },
            {
              label: "Planning vs Monitoring",
              slug: "architecture/03-planning-vs-monitoring",
            },
          ],
        },
        {
          label: "Prerequisites",
          items: [
            {
              label: "Tools and Accounts",
              slug: "walkthrough/02-prerequisites",
            },
            { label: "Pre-flight", slug: "walkthrough/03-preflight" },
          ],
        },
        {
          label: "Architecture",
          items: [
            {
              label: "Account Topology",
              slug: "architecture/01-account-topology",
            },
            {
              label: "Pool Hierarchy",
              slug: "architecture/02-pool-hierarchy",
            },
            {
              label: "RAM and Onboarding",
              slug: "architecture/04-ram-and-onboarding",
            },
          ],
        },
        {
          label: "Deploy",
          items: [
            { label: "Org Bootstrap", slug: "walkthrough/04-org-bootstrap" },
            { label: "IPAM Deploy", slug: "walkthrough/05-ipam-deploy" },
            {
              label: "Workload Deploy",
              slug: "walkthrough/06-workload-deploy",
            },
          ],
        },
        {
          label: "Verification",
          items: [
            {
              label: "Post-Deploy Checks",
              slug: "walkthrough/07-verification",
            },
          ],
        },
        {
          label: "Troubleshooting",
          items: [
            {
              label: "Common Issues",
              slug: "walkthrough/08-troubleshooting",
            },
          ],
        },
        {
          label: "Reference",
          items: [
            { label: "FAQ", slug: "reference/02-faq" },
            { label: "Decision Log", slug: "reference/04-decision-log" },
            { label: "AWS References", slug: "reference/05-aws-references" },
            { label: "Teardown", slug: "walkthrough/09-teardown" },
          ],
        },
      ],
    }),
  ],
});
