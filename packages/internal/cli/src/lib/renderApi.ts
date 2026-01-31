/**
 * Render.com API Client
 * API Documentation: https://api-docs.render.com/reference/introduction
 */

export interface RenderService {
  id: string;
  name: string;
  ownerId: string;
  type: 'web_service' | 'static_site' | 'private_service' | 'background_worker' | 'cron_job';
  suspended: 'suspended' | 'not_suspended';
  serviceDetails: {
    url?: string;
    region?: string;
    plan?: string;
  };
}

export interface RenderDeploy {
  id: string;
  commit?: {
    id: string;
    message: string;
  };
  status: 'created' | 'build_in_progress' | 'update_in_progress' | 'live' | 'deactivated' | 'build_failed' | 'update_failed' | 'canceled';
  createdAt: string;
}

export interface RenderOwner {
  id: string;
  name: string;
  email: string;
  type: 'user' | 'team';
}

export class RenderApiClient {
  private baseUrl = 'https://api.render.com/v1';
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Render API error (${response.status}): ${errorText}`);
    }

    const text = await response.text();
    if (!text) return {} as T;
    return JSON.parse(text) as T;
  }

  async getOwners(): Promise<RenderOwner[]> {
    const result = await this.request<{ owner: RenderOwner }[]>('GET', '/owners');
    return result.map((item) => item.owner);
  }

  async getServices(ownerId?: string): Promise<RenderService[]> {
    const params = new URLSearchParams();
    if (ownerId) params.append('ownerId', ownerId);
    params.append('limit', '100');

    const result = await this.request<{ service: RenderService }[]>(
      'GET',
      `/services?${params.toString()}`
    );
    return result.map((item) => item.service);
  }

  async triggerDeploy(serviceId: string, clearCache = false): Promise<RenderDeploy> {
    return this.request<RenderDeploy>('POST', `/services/${serviceId}/deploys`, {
      clearCache: clearCache ? 'clear' : 'do_not_clear',
    });
  }

  async getDeploys(serviceId: string, limit = 10): Promise<RenderDeploy[]> {
    const result = await this.request<{ deploy: RenderDeploy }[]>(
      'GET',
      `/services/${serviceId}/deploys?limit=${limit}`
    );
    return result.map((item) => item.deploy);
  }

  async getDeploy(serviceId: string, deployId: string): Promise<RenderDeploy> {
    return this.request<RenderDeploy>('GET', `/services/${serviceId}/deploys/${deployId}`);
  }

  async validateApiKey(): Promise<boolean> {
    try {
      await this.getOwners();
      return true;
    } catch {
      return false;
    }
  }
}

export function getDeployStatusEmoji(status: RenderDeploy['status']): string {
  const emojis: Record<RenderDeploy['status'], string> = {
    created: '🆕',
    build_in_progress: '🔨',
    update_in_progress: '🔄',
    live: '✅',
    deactivated: '⏸️',
    build_failed: '❌',
    update_failed: '❌',
    canceled: '🚫',
  };
  return emojis[status] || '❓';
}
