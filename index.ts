import { MiraiHttpWsAdapter } from "./src/adapter.js";

let adapter = new MiraiHttpWsAdapter("192.168.6.244", 8999, 3309659104, "INITKEYUxz9y3jt")
adapter.connect()