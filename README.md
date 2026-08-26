# mcp-themeparks

ThemeParks.wiki MCP — live theme park wait times, schedules, and attraction data.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1476+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `list_destinations` | List all theme park destinations (Disney, Universal, Six Flags, SeaWorld, etc.) and their parks. Use this first to discover the PARK entity id, then feed that id to get_wait_times / get_schedule / get_entity. |
| `get_wait_times` | Live theme park wait times — how long is the wait for an attraction right now. Returns standby and single-rider ride queue minutes plus operating status for every attraction in a park (e.g. Disney / Universal ride queues). Pass a PARK entity_id from list_destinations. |
| `get_schedule` | Park operating hours — opening and closing times for a theme park over the coming weeks. Pass a PARK entity_id from list_destinations. |
| `get_entity` | Metadata for any theme park entity (destination, park, attraction, restaurant, or show): name, type, location, timezone, and parent ids. |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "themeparks": {
      "url": "https://gateway.pipeworx.io/themeparks/mcp"
    }
  }
}
```

### What this endpoint actually serves

`tools/list` at `https://gateway.pipeworx.io/themeparks/mcp` returns the tools in the table
above **plus the shared Pipeworx meta-tools** — `ask_pipeworx`,
`discover_tools`, `search_within`, `remember`/`recall` and the rest of the
gateway-wide set. So the tool count you see is larger than this table: a
single-pack endpoint currently lists roughly 30 shared tools alongside the
pack's own. The connection's `initialize` response states its exact scope, and
is the authoritative answer for a given day.

This is deliberate, not multiplexing by accident. The meta-tools are what let a
scoped connection answer a question this pack does not cover — via
`ask_pipeworx`, which routes across the whole catalog — without you adding a
second MCP server. There is currently no way to mount a pack endpoint without
them; if the extra schemas cost you more context than the routing is worth,
connect to the full gateway once rather than to several pack endpoints.

Or connect to the full Pipeworx gateway to get every pack's tools listed
directly, instead of just this one's:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

Both URLs reach the same gateway and the same 1476+ data sources. The
only difference is which pack's tools are listed **directly**; `ask_pipeworx`
reaches all of them from either one.

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English —
this works on the pack endpoint above as well as on the full gateway:

```
ask_pipeworx({ question: "your question about Themeparks data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
