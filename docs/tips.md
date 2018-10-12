---
title: Hints and Tips
project: tachyon
permalink: '/projects/tachyon/tips/'
---

## Regions

When running Tachyon in production, we recommend running one Tachyon instance per region. This instance should connect to the S3 bucket for the region, which can then be shared across all stacks in that region.

While S3 buckets can be accessed from any region, running Lambda from the same region as the bucket is recommended. This reduces latency and improves image serving speed.
