import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

// The picture shown when a link to the site is shared. Product pages replace
// it with the product's own photograph.
export const alt = "Blackground";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const logo = await readFile(join(process.cwd(), "public/logo.png"));
const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#080808",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- drawn into an image, not a page */}
        <img src={logoSrc} alt="" width={260} height={256} />
      </div>
    ),
    size,
  );
}
