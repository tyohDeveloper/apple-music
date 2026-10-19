// Browser entry: renders the application into the page's mount point.
import { render } from "preact";
import { findMountPoint } from "./controllers/findMountPoint.ts";
import { App } from "./views/App.tsx";

render(<App />, findMountPoint());
