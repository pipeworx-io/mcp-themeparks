interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * ThemeParks.wiki MCP — live theme park wait times, schedules, and attraction data.
 * Keyless. Covers Disney, Universal, Six Flags, SeaWorld, and more.
 */


const BASE = 'https://api.themeparks.wiki/v1';
const UA = 'pipeworx/1.0 (+https://pipeworx.io)';

const tools: McpToolExport['tools'] = [
  {
    name: 'list_destinations',
    description:
      'List all theme park destinations (Disney, Universal, Six Flags, SeaWorld, etc.) and their parks. Use this first to discover the PARK entity id, then feed that id to get_wait_times / get_schedule / get_entity.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'get_wait_times',
    description:
      'Live theme park wait times — how long is the wait for an attraction right now. Returns standby and single-rider ride queue minutes plus operating status for every attraction in a park (e.g. Disney / Universal ride queues). Pass a PARK entity_id from list_destinations.',
    inputSchema: {
      type: 'object',
      properties: {
        entity_id: { type: 'string', description: 'A PARK entity id from list_destinations.' },
      },
      required: ['entity_id'],
    },
  },
  {
    name: 'get_schedule',
    description:
      'Park operating hours — opening and closing times for a theme park over the coming weeks. Pass a PARK entity_id from list_destinations.',
    inputSchema: {
      type: 'object',
      properties: {
        entity_id: { type: 'string', description: 'A PARK entity id from list_destinations.' },
      },
      required: ['entity_id'],
    },
  },
  {
    name: 'get_entity',
    description:
      'Metadata for any theme park entity (destination, park, attraction, restaurant, or show): name, type, location, timezone, and parent ids.',
    inputSchema: {
      type: 'object',
      properties: {
        entity_id: { type: 'string', description: 'An entity id from list_destinations or get_wait_times.' },
      },
      required: ['entity_id'],
    },
  },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case 'list_destinations': {
      const data = (await tpGet('/destinations')) as {
        destinations?: { id: string; name: string; slug: string; parks?: { id: string; name: string }[] }[];
      };
      if ('error' in (data as object)) return data;
      return (data.destinations || []).map((d) => ({
        id: d.id,
        name: d.name,
        slug: d.slug,
        parks: (d.parks || []).map((p) => ({ id: p.id, name: p.name })),
      }));
    }
    case 'get_wait_times': {
      const id = reqStr(args, 'entity_id');
      const data = (await tpGet(`/entity/${encodeURIComponent(id)}/live`)) as {
        name?: string;
        liveData?: {
          id: string;
          name: string;
          entityType: string;
          status: string;
          queue?: { STANDBY?: { waitTime: number | null }; SINGLE_RIDER?: { waitTime: number | null } };
          lastUpdated: string;
        }[];
      };
      if ('error' in (data as object)) return data;
      return {
        park: data.name,
        attractions: (data.liveData || [])
          .filter((e) => e.entityType === 'ATTRACTION')
          .map((a) => ({
            id: a.id,
            name: a.name,
            status: a.status,
            wait_minutes: a.queue?.STANDBY?.waitTime ?? null,
            single_rider: a.queue?.SINGLE_RIDER?.waitTime ?? null,
            last_updated: a.lastUpdated,
          })),
      };
    }
    case 'get_schedule': {
      const id = reqStr(args, 'entity_id');
      const data = (await tpGet(`/entity/${encodeURIComponent(id)}/schedule`)) as {
        name?: string;
        schedule?: { date: string; type: string; openingTime: string; closingTime: string }[];
      };
      if ('error' in (data as object)) return data;
      return {
        park: data.name,
        schedule: (data.schedule || []).slice(0, 30).map((s) => ({
          date: s.date,
          type: s.type,
          opening: s.openingTime,
          closing: s.closingTime,
        })),
      };
    }
    case 'get_entity': {
      const id = reqStr(args, 'entity_id');
      const data = (await tpGet(`/entity/${encodeURIComponent(id)}`)) as {
        id?: string;
        name?: string;
        entityType?: string;
        slug?: string;
        location?: unknown;
        timezone?: string;
        destinationId?: string;
        parentId?: string;
      };
      if ('error' in (data as object)) return data;
      return {
        id: data.id,
        name: data.name,
        entity_type: data.entityType,
        slug: data.slug,
        location: data.location,
        timezone: data.timezone,
        destination_id: data.destinationId,
        parent_id: data.parentId,
      };
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

async function tpGet(path: string): Promise<unknown> {
  const res = await fetch(`${BASE}${path}`, { headers: { Accept: 'application/json', 'User-Agent': UA } });
  if (!res.ok) {
    return { error: res.status, message: (await res.text()).slice(0, 200) };
  }
  return res.json();
}

function reqStr(args: Record<string, unknown>, key: string): string {
  const v = args[key];
  if (typeof v !== 'string' || !v.trim()) {
    throw new Error(`Required argument "${key}" is missing. Pass a PARK entity id from list_destinations.`);
  }
  return v;
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
