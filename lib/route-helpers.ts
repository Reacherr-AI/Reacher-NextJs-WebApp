export type ParsedResponse<T> = {
  ok: boolean;
  status: number;
  data: T | { message: string };
};

export const parseJsonResponse = async <T>(res: Response): Promise<ParsedResponse<T>> => {
  const text = await res.text();
  let data: T | { message: string };

  try {
    data = text ? (JSON.parse(text) as T) : ({ message: 'Empty response' } as const);
  } catch {
    data = { message: text || 'Non-JSON response' };
  }

  return { ok: res.ok, status: res.status, data };
};
