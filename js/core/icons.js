
/* =====================================================
   ECOSORT - ICON BRIDGE
   Original SVG registry: components/ui.js
===================================================== */

import { Icon, iconPaths } from "../components/ui.js";

export function icon(name, size = 20) {
  return Icon({
    name,
    size
  }).outerHTML;
}

export { iconPaths };

export default icon;