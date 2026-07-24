export type SearchValue = string | string[] | null | undefined;
export type SearchRecord = Record<string, SearchValue>;

export function first(value: SearchValue) {
  const item = Array.isArray(value) ? value[0] : value;
  if (item == null) return undefined;
  return item.trim() === "" ? undefined : item;
}
export function pageHref(path:string,params:SearchRecord,page:number){const query=new URLSearchParams();for(const [key,value] of Object.entries(params)){const item=first(value);if(item&&key!=="page")query.set(key,item)}query.set("page",String(page));return `${path}?${query.toString()}`;}
