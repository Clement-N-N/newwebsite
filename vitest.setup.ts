import "@testing-library/jest-dom/vitest";
import { MotionGlobalConfig } from "motion/react";

// Component tests check behaviour, not animation timing.
MotionGlobalConfig.skipAnimations = true;

import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(cleanup);
