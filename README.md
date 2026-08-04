# mcp-themeparks

ThemeParks.wiki MCP — live theme park wait times, schedules, and attraction data.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

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

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Themeparks data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
