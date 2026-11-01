import Database from 'better-sqlite3';
import fs from 'node:fs';
import { EventEmitter } from 'node:events';
import { createRequire } from 'node:module';
import mineflayer from 'mineflayer';
import Anthropic from '@anthropic-ai/sdk';
import express from 'express';
import { createServer } from 'node:http';
import { WebSocketServer } from 'ws';
import { randomUUID } from 'node:crypto';
const HTML = Buffer.from('PCFkb2N0eXBlIGh0bWw+PGh0bWwgbGFuZz0iYXIiIGRpcj0icnRsIj48aGVhZD48bWV0YSBjaGFyc2V0PSJ1dGYtOCI+PG1ldGEgbmFtZT0idmlld3BvcnQiIGNvbnRlbnQ9IndpZHRoPWRldmljZS13aWR0aCxpbml0aWFsLXNjYWxlPTEiPgo8dGl0bGU+Q2xvdWQgQ29udHJvbDwvdGl0bGU+CjxsaW5rIGhyZWY9Imh0dHBzOi8vZm9udHMuZ29vZ2xlYXBpcy5jb20vY3NzMj9mYW1pbHk9SUJNK1BsZXgrU2FucytBcmFiaWM6d2dodEA0MDA7NjAwOzcwMCZkaXNwbGF5PXN3YXAiIHJlbD0ic3R5bGVzaGVldCI+CjxzdHlsZT4KOnJvb3R7LS1iZzojRUVGM0Y3Oy0taW5rOiMxMDI0M0E7LS1tdXRlOiM1QjZFODA7LS1saW5lOiNDRkRBRTQ7LS1jYXJkOiNmZmY7LS1hYzojMEU3Qzg2Oy0td2FybjojQzAzOTJCfQoqe2JveC1zaXppbmc6Ym9yZGVyLWJveH1ib2R5e21hcmdpbjowO2JhY2tncm91bmQ6dmFyKC0tYmcpO2NvbG9yOnZhcigtLWluayk7Zm9udDoxNXB4LzEuNiAiSUJNIFBsZXggU2FucyBBcmFiaWMiLHN5c3RlbS11aSxzYW5zLXNlcmlmfQpoZWFkZXJ7cGFkZGluZzoyNHB4IDIwcHggOHB4O2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpiYXNlbGluZTtnYXA6MTRweDtmbGV4LXdyYXA6d3JhcH0KaDF7bWFyZ2luOjA7Zm9udC1zaXplOjQ0cHg7bGluZS1oZWlnaHQ6MTtmb250LXdlaWdodDo3MDA7bGV0dGVyLXNwYWNpbmc6LTFweH1oMSBzbWFsbHtmb250LXNpemU6MTVweDtjb2xvcjp2YXIoLS1tdXRlKTtmb250LXdlaWdodDo0MDA7bWFyZ2luLWlubGluZS1zdGFydDoxMHB4fQptYWlue2Rpc3BsYXk6Z3JpZDtncmlkLXRlbXBsYXRlLWNvbHVtbnM6MzQwcHggMWZyO2dhcDoxNnB4O3BhZGRpbmc6MTJweCAyMHB4IDI0cHh9QG1lZGlhKG1heC13aWR0aDo4MjBweCl7bWFpbntncmlkLXRlbXBsYXRlLWNvbHVtbnM6MWZyfX0Kc2VjdGlvbntiYWNrZ3JvdW5kOnZhcigtLWNhcmQpO2JvcmRlcjoxcHggc29saWQgdmFyKC0tbGluZSk7Ym9yZGVyLXJhZGl1czo2cHg7cGFkZGluZzoxNHB4IDE2cHg7bWFyZ2luLWJvdHRvbToxMnB4fQpoMnttYXJnaW46MCAwIDhweDtmb250LXNpemU6MTVweDtmb250LXdlaWdodDo2MDB9CmJ1dHRvbntmb250OmluaGVyaXQ7Ym9yZGVyOjFweCBzb2xpZCB2YXIoLS1pbmspO2JhY2tncm91bmQ6dmFyKC0taW5rKTtjb2xvcjojZmZmO2JvcmRlci1yYWRpdXM6NHB4O3BhZGRpbmc6NnB4IDEycHg7Y3Vyc29yOnBvaW50ZXJ9CmJ1dHRvbi5ve2JhY2tncm91bmQ6I2ZmZjtjb2xvcjp2YXIoLS1pbmspfWJ1dHRvbjpmb2N1cy12aXNpYmxlLGlucHV0OmZvY3VzLXZpc2libGUsc2VsZWN0OmZvY3VzLXZpc2libGV7b3V0bGluZTozcHggc29saWQgdmFyKC0tYWMpO291dGxpbmUtb2Zmc2V0OjJweH0KaW5wdXQsc2VsZWN0e2ZvbnQ6aW5oZXJpdDtib3JkZXI6MXB4IHNvbGlkIHZhcigtLWxpbmUpO2JvcmRlci1yYWRpdXM6NHB4O3BhZGRpbmc6NnB4IDhweDt3aWR0aDoxMDAlO21hcmdpbi1ib3R0b206NnB4O2JhY2tncm91bmQ6I2ZmZn0KLnJvd3tkaXNwbGF5OmZsZXg7Z2FwOjZweDtmbGV4LXdyYXA6d3JhcH0ucm93Pip7ZmxleDoxfS5kb3R7ZGlzcGxheTppbmxpbmUtYmxvY2s7d2lkdGg6OXB4O2hlaWdodDo5cHg7Ym9yZGVyLXJhZGl1czo1MCU7YmFja2dyb3VuZDp2YXIoLS13YXJuKTttYXJnaW4taW5saW5lLWVuZDo2cHh9LmRvdC5vbntiYWNrZ3JvdW5kOnZhcigtLWFjKX0KLmJhcntoZWlnaHQ6OHB4O2JhY2tncm91bmQ6dmFyKC0tbGluZSk7Ym9yZGVyLXJhZGl1czo0cHg7b3ZlcmZsb3c6aGlkZGVuO21hcmdpbjoycHggMCA4cHh9LmJhciBpe2Rpc3BsYXk6YmxvY2s7aGVpZ2h0OjEwMCU7YmFja2dyb3VuZDp2YXIoLS1hYyl9LmJhci5mIGl7YmFja2dyb3VuZDojQjk4MzFDfQojbG9ne2hlaWdodDo0MjBweDtvdmVyZmxvdzphdXRvO2ZvbnQtc2l6ZToxM3B4O2JhY2tncm91bmQ6I0Y4RkJGRDtib3JkZXI6MXB4IHNvbGlkIHZhcigtLWxpbmUpO2JvcmRlci1yYWRpdXM6NHB4O3BhZGRpbmc6OHB4fQojbG9nIGRpdntwYWRkaW5nOjFweCAwfS5rLWNoYXR7Y29sb3I6dmFyKC0taW5rKX0uay1hY3Rpb257Y29sb3I6dmFyKC0tYWMpfS5rLWVycm9ye2NvbG9yOnZhcigtLXdhcm4pfS5rLXN5c3RlbSwuay1zZXJ2ZXIsLmstYXV0aHtjb2xvcjp2YXIoLS1tdXRlKX0uay1hdXRoe2ZvbnQtd2VpZ2h0OjYwMDtjb2xvcjp2YXIoLS1pbmspfQp1bHttYXJnaW46MDtwYWRkaW5nLWlubGluZS1zdGFydDoxOHB4O2NvbG9yOnZhcigtLW11dGUpfQo8L3N0eWxlPjwvaGVhZD48Ym9keT4KPGhlYWRlcj48aDE+Q2xvdWQ8c21hbGw+Q2xvdWQgQ29udHJvbCDCtyBZQU1FTiBBSSBNSU5FQ1JBRlQ8L3NtYWxsPjwvaDE+PC9oZWFkZXI+CjxtYWluPjxkaXY+CjxzZWN0aW9uPjxoMj7Yp9mE2K3Yp9mE2Kk8L2gyPjxkaXY+PHNwYW4gY2xhc3M9ImRvdCIgaWQ9ImQiPjwvc3Bhbj48c3BhbiBpZD0ic3QiPuKAlDwvc3Bhbj48L2Rpdj4KPGRpdiBpZD0ic3J2IiBzdHlsZT0iY29sb3I6dmFyKC0tbXV0ZSkiPjwvZGl2PjxkaXYgaWQ9InBvcyIgc3R5bGU9ImNvbG9yOnZhcigtLW11dGUpIj48L2Rpdj4KPGRpdiBjbGFzcz0icm93IiBzdHlsZT0ibWFyZ2luLXRvcDo4cHgiPjxidXR0b24gaWQ9InN0YXJ0Ij7Yqti02LrZitmEIENsb3VkPC9idXR0b24+PGJ1dHRvbiBjbGFzcz0ibyIgaWQ9InN0b3AiPtil2YrZgtin2YE8L2J1dHRvbj48L2Rpdj4KPGRpdiBpZD0iYXBpIiBzdHlsZT0ibWFyZ2luLXRvcDo4cHg7Y29sb3I6dmFyKC0tbXV0ZSkiPjwvZGl2Pjwvc2VjdGlvbj4KPHNlY3Rpb24+PGgyPtin2YTYtdit2Kkg2YjYp9mE2LfYudin2YU8L2gyPtin2YTYtdit2KkgPGIgaWQ9ImhwIj4tPC9iPjxkaXYgY2xhc3M9ImJhciI+PGkgaWQ9ImhwYiI+PC9pPjwvZGl2Ptin2YTYt9i52KfZhSA8YiBpZD0iZmQiPi08L2I+PGRpdiBjbGFzcz0iYmFyIGYiPjxpIGlkPSJmZGIiPjwvaT48L2Rpdj48L3NlY3Rpb24+CjxzZWN0aW9uPjxoMj7Yp9mE2YXZh9mF2Kkg2KfZhNit2KfZhNmK2Kk8L2gyPjxkaXYgaWQ9InRhc2siPtmE2Kcg2KrZiNis2K8g2YXZh9mF2Kk8L2Rpdj48L3NlY3Rpb24+CjxzZWN0aW9uPjxoMj7Yp9mE2YXYrtiy2YjZhjwvaDI+PHVsIGlkPSJpbnYiPjwvdWw+PC9zZWN0aW9uPgo8c2VjdGlvbj48aDI+2KfZhNiz2YrYsdmB2LHYp9iqPC9oMj48c2VsZWN0IGlkPSJzZWwiPjwvc2VsZWN0Pgo8ZGl2IGNsYXNzPSJyb3ciPjxidXR0b24gaWQ9ImNvbiI+2KfYqti12KfZhDwvYnV0dG9uPjxidXR0b24gY2xhc3M9Im8iIGlkPSJkaXMiPtmC2LfYuSDYp9mE2KfYqti12KfZhDwvYnV0dG9uPjwvZGl2Pgo8ZGV0YWlscyBzdHlsZT0ibWFyZ2luLXRvcDo4cHgiPjxzdW1tYXJ5Ptil2LbYp9mB2Kkg2LPZitix2YHYsTwvc3VtbWFyeT4KPGlucHV0IGlkPSJuIiBwbGFjZWhvbGRlcj0i2KfYs9mFINin2YTYs9mK2LHZgdixIj48aW5wdXQgaWQ9ImgiIHBsYWNlaG9sZGVyPSLYp9mE2LnZhtmI2KfZhiAoSVApIj48aW5wdXQgaWQ9InAiIHBsYWNlaG9sZGVyPSLYp9mE2YXZhtmB2LAiIHZhbHVlPSIyNTU2NSI+PGlucHV0IGlkPSJ2IiBwbGFjZWhvbGRlcj0i2KfZhNil2LXYr9in2LEgKNin2K7YqtmK2KfYsdmKKSI+PGlucHV0IGlkPSJwdyIgcGxhY2Vob2xkZXI9ItmD2YTZhdipINiz2LEg2YTZhNiq2LPYrNmK2YQgL3JlZ2lzdGVyICjYp9iu2KrZitin2LHZiikiPgo8bGFiZWw+PGlucHV0IHR5cGU9ImNoZWNrYm94IiBpZD0iYSIgc3R5bGU9IndpZHRoOmF1dG8iPiDYo9mF2YTZgyDZh9iw2Kcg2KfZhNiz2YrYsdmB2LEg2KPZiCDYudmG2K/ZiiDYpdiw2YYg2KjYp9mE2K/YrtmI2YQ8L2xhYmVsPjxidXR0b24gaWQ9ImFkZCIgc3R5bGU9Im1hcmdpbi10b3A6NnB4Ij7YrdmB2Lg8L2J1dHRvbj48L2RldGFpbHM+PC9zZWN0aW9uPgo8L2Rpdj48ZGl2Pgo8c2VjdGlvbj48aDI+2KfZhNi02KfYqiDZiNiz2KzZhCDYp9mE2KPYudmF2KfZhDwvaDI+PGRpdiBpZD0ibG9nIj48L2Rpdj4KPGRpdiBjbGFzcz0icm93IiBzdHlsZT0ibWFyZ2luLXRvcDo4cHgiPjxpbnB1dCBpZD0iY21kIiBwbGFjZWhvbGRlcj0i2KfZg9iq2Kgg2KPZhdix2KfZiyDZhNmAIENsb3VkICjZhdir2YTYp9mLOiDYp9io2YbZkCDZhdij2YjZiSDZiNis2YXZkdi5INiu2LTYqCkiIHN0eWxlPSJmbGV4OjQ7bWFyZ2luOjAiPjxidXR0b24gaWQ9InNlbmQiPtil2LHYs9in2YQ8L2J1dHRvbj48L2Rpdj48L3NlY3Rpb24+CjxzZWN0aW9uPjxoMj7Yo9ix2LTZitmBINin2YTYo9mI2KfZhdixINmI2KfZhNmF2LnZhNmI2YXYp9iqPC9oMj48ZGl2IHN0eWxlPSJjb2xvcjp2YXIoLS1tdXRlKSI+2YPZhCDYs9mK2LHZgdixINmE2Ycg2YLYp9i52K/YqSDYqNmK2KfZhtin2Kog2YXZhtmB2LXZhNipINiv2KfYrtmEIGRhdGEvc2VydmVycy88L2Rpdj48L3NlY3Rpb24+CjwvZGl2PjwvbWFpbj4KPHNjcmlwdD4KY29uc3QgJD1pPT5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChpKSxhcGk9KHAsYik9PmZldGNoKCcvYXBpLycrcCx7bWV0aG9kOidQT1NUJyxoZWFkZXJzOnsnQ29udGVudC1UeXBlJzonYXBwbGljYXRpb24vanNvbid9LGJvZHk6SlNPTi5zdHJpbmdpZnkoYnx8e30pfSk7CiQoJ3N0YXJ0Jykub25jbGljaz0oKT0+YXBpKCdzdGFydCcpOyQoJ3N0b3AnKS5vbmNsaWNrPSgpPT5hcGkoJ3N0b3AnKTskKCdkaXMnKS5vbmNsaWNrPSgpPT5hcGkoJ2Rpc2Nvbm5lY3QnKTskKCdjb24nKS5vbmNsaWNrPSgpPT5hcGkoJ2Nvbm5lY3QnLHtpZDokKCdzZWwnKS52YWx1ZX0pOwokKCdhZGQnKS5vbmNsaWNrPSgpPT5hcGkoJ3NlcnZlcnMnLHtuYW1lOiQoJ24nKS52YWx1ZSxob3N0OiQoJ2gnKS52YWx1ZSxwb3J0OiQoJ3AnKS52YWx1ZSx2ZXJzaW9uOiQoJ3YnKS52YWx1ZSxwYXNzd29yZDokKCdwdycpLnZhbHVlLGF1dGhvcml6ZWQ6JCgnYScpLmNoZWNrZWR9KS50aGVuKHI9PnIub2t8fGFsZXJ0KCfYo9mD2ZHYryDYp9mE2KXYsNmGINmI2KfZhdmE2KMg2KfZhNin2LPZhSDZiNin2YTYudmG2YjYp9mGJykpOwpjb25zdCBzZW5kPSgpPT57aWYoJCgnY21kJykudmFsdWUudHJpbSgpKXthcGkoJ2NvbW1hbmQnLHt0ZXh0OiQoJ2NtZCcpLnZhbHVlfSk7JCgnY21kJykudmFsdWU9Jyd9fTskKCdzZW5kJykub25jbGljaz1zZW5kOyQoJ2NtZCcpLm9ua2V5ZG93bj1lPT5lLmtleT09PSdFbnRlcicmJnNlbmQoKTsKY29uc3Qgd3M9bmV3IFdlYlNvY2tldCgobG9jYXRpb24ucHJvdG9jb2w9PT0naHR0cHM6Jz8nd3NzOi8vJzond3M6Ly8nKStsb2NhdGlvbi5ob3N0KTsKd3Mub25tZXNzYWdlPWU9Pntjb25zdHt0eXBlLGRhdGF9PUpTT04ucGFyc2UoZS5kYXRhKTsKaWYodHlwZT09PSdsb2cnKXtjb25zdCBkPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO2QuY2xhc3NOYW1lPSdrLScrZGF0YS5raW5kO2QudGV4dENvbnRlbnQ9bmV3IERhdGUoZGF0YS50KS50b0xvY2FsZVRpbWVTdHJpbmcoKSsnICAnK2RhdGEudGV4dDtjb25zdCBsPSQoJ2xvZycpO2wuYXBwZW5kKGQpO2wuc2Nyb2xsVG9wPWwuc2Nyb2xsSGVpZ2h0fQppZih0eXBlPT09J3NlcnZlcnMnKSQoJ3NlbCcpLmlubmVySFRNTD1kYXRhLm1hcChzPT5gPG9wdGlvbiB2YWx1ZT0iJHtzLmlkfSI+JHtzLm5hbWV9ICgke3MuaG9zdH06JHtzLnBvcnR9KTwvb3B0aW9uPmApLmpvaW4oJycpOwppZih0eXBlPT09J3N0YXRlJyl7Y29uc3Qgcz1kYXRhOyQoJ2QnKS5jbGFzc05hbWU9J2RvdCcrKHMuY29ubmVjdGVkPycgb24nOicnKTskKCdzdCcpLnRleHRDb250ZW50PXMuY29ubmVjdGVkPyfZhdiq2LXZhCc6J9i62YrYsSDZhdiq2LXZhCc7CiQoJ3NydicpLnRleHRDb250ZW50PXMuc2VydmVyP2Ake3Muc2VydmVyLm5hbWV9IMK3ICR7cy52ZXJzaW9ufHwnJ30gwrcgJHtzLnBsYXllcnMubGVuZ3RofSDZhNin2LnYqGA6Jyc7CiQoJ3BvcycpLnRleHRDb250ZW50PXMucG9zP2DYp9mE2YXZiNmC2Lk6ICR7cy5wb3MueH0sICR7cy5wb3MueX0sICR7cy5wb3Muen1gOicnOwokKCdhcGknKS50ZXh0Q29udGVudD0nQ2xhdWRlIEFQSTogJysocy5hcGlPaz09PW51bGw/J9mE2YUg2YrZj9iu2KrYqNixJzpzLmFwaU9rPyfZiti52YXZhCc6J9iu2LfYoycpKycgwrcg2KfZhNi52YLZhDogJysocy5icmFpbj8ocy5idXN5PyfZitmB2YPYsSc6J9is2KfZh9iyJyk6J9mF2KrZiNmC2YEnKTsKJCgnaHAnKS50ZXh0Q29udGVudD1zLmhlYWx0aD8/Jy0nOyQoJ2hwYicpLnN0eWxlLndpZHRoPSgocy5oZWFsdGh8fDApLzIwKjEwMCkrJyUnOyQoJ2ZkJykudGV4dENvbnRlbnQ9cy5mb29kPz8nLSc7JCgnZmRiJykuc3R5bGUud2lkdGg9KChzLmZvb2R8fDApLzIwKjEwMCkrJyUnOwokKCd0YXNrJykudGV4dENvbnRlbnQ9cy50YXNrfHwn2YTYpyDYqtmI2KzYryDZhdmH2YXYqSc7JCgnaW52JykuaW5uZXJIVE1MPXMuaW52ZW50b3J5Lm1hcChpPT5gPGxpPiR7aX08L2xpPmApLmpvaW4oJycpfHwnPGxpPtmB2KfYsdi6PC9saT4nfX07Cjwvc2NyaXB0PjwvYm9keT48L2h0bWw+Cg==', 'base64').toString();
// قاعدة بيانات منفصلة لكل سيرفر: data/servers/<id>.db
function openDb(id) {
  fs.mkdirSync('data/servers', { recursive: true });
  const d = new Database(`data/servers/${id}.db`);
  d.exec('create table if not exists kv(k text primary key, v text); create table if not exists log(t integer, kind text, text text);');
  return {
    get: k => d.prepare('select v from kv where k=?').pluck().get(k),
    set: (k, v) => d.prepare('insert or replace into kv values(?,?)').run(k, String(v)),
    all: () => Object.fromEntries(d.prepare('select k,v from kv').all().map(r => [r.k, r.v])),
    log: (kind, text) => d.prepare('insert into log values(?,?,?)').run(Date.now(), kind, text),
    recent: (n = 100) => d.prepare('select * from log order by t desc limit ?').all(n).reverse(),
  };
}
const F = 'data/servers.json';
const listServers = () => (fs.existsSync(F) ? JSON.parse(fs.readFileSync(F)) : []);
const saveServers = s => { fs.mkdirSync('data', { recursive: true }); fs.writeFileSync(F, JSON.stringify(s, null, 2)); };

const require = createRequire(import.meta.url);
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const { plugin: pvp } = require('mineflayer-pvp');
const { plugin: collectBlock } = require('mineflayer-collectblock');

const obj = (props, req = []) => ({ type: 'object', properties: props, required: req });
const S = { type: 'string' }, N = { type: 'number' };
const TOOLS = [
  { name: 'say', description: 'Send a public chat message. Keep it short; never spam.', input_schema: obj({ text: S }, ['text']) },
  { name: 'whisper', description: 'Private message via /msg.', input_schema: obj({ to: S, text: S }, ['to', 'text']) },
  { name: 'goto', description: 'Walk to coordinates.', input_schema: obj({ x: N, y: N, z: N }, ['x', 'y', 'z']) },
  { name: 'collect', description: 'Mine/collect nearby blocks by name (e.g. oak_log).', input_schema: obj({ block: S, count: N }, ['block']) },
  { name: 'craft', description: 'Craft an item (uses a nearby crafting table if needed).', input_schema: obj({ item: S, count: N }, ['item']) },
  { name: 'equip', description: 'Equip an item from inventory.', input_schema: obj({ item: S }, ['item']) },
  { name: 'attack', description: 'Fight a nearby entity/player by name (only when it is allowed by server rules).', input_schema: obj({ target: S }, ['target']) },
  { name: 'stop', description: 'Stop moving/fighting.', input_schema: obj({}) },
  { name: 'look_around', description: 'List nearby players, mobs and notable blocks.', input_schema: obj({}) },
  { name: 'inventory', description: 'List inventory.', input_schema: obj({}) },
  { name: 'run_command', description: 'Run a server command the server allows (e.g. /rules, /kit).', input_schema: obj({ command: S }, ['command']) },
  { name: 'remember', description: 'Save a note for THIS server only (rules, coordinates, kits...).', input_schema: obj({ key: S, value: S }, ['key', 'value']) },
  { name: 'set_task', description: 'Set the current long-running task, or "" when done.', input_schema: obj({ task: S }, ['task']) },
];

class Cloud extends EventEmitter {
  constructor() {
    super();
    this.ai = new Anthropic();
    this.model = process.env.CLAUDE_MODEL || 'claude-sonnet-4-6';
    this.enabled = false; this.busy = false; this.pending = []; this.task = ''; this.apiOk = null; this.lastSay = 0;
    setInterval(() => { if (this.enabled && this.bot && this.task && !this.busy) this.think('Continue the current task with the next concrete steps.'); }, 20000);
  }
  log(kind, text) { try { this.db?.log(kind, text); } catch {} this.emit('log', { t: Date.now(), kind, text }); }
  start() { this.enabled = true; this.log('system', 'Cloud brain started'); }
  stop() { this.enabled = false; this.disconnect(); this.log('system', 'Cloud stopped'); }

  connect(srv) {
    this.disconnect(); this.srv = srv; this.db = openDb(srv.id); this.want = true; this.task = this.db.get('task') || '';
    this.log('system', `Connecting to ${srv.host}:${srv.port}`);
    const bot = (this.bot = mineflayer.createBot({
      host: srv.host, port: srv.port, version: srv.version || undefined,
      username: process.env.MC_USERNAME || 'Cloud', auth: process.env.MC_AUTH || 'microsoft',
      onMsaCode: c => this.log('auth', `Open ${c.verification_uri} and enter code ${c.user_code}`),
    }));
    bot.loadPlugin(pathfinder); bot.loadPlugin(pvp); bot.loadPlugin(collectBlock);
    bot.once('spawn', () => { this.log('system', `Joined (version ${bot.version})`); this.db.set('version', bot.version); this.learn(); });
    bot.on('chat', (u, m) => { if (u === bot.username) return; this.log('chat', `<${u}> ${m}`); this.think(`Player ${u} said in public chat: ${m}`); });
    bot.on('whisper', (u, m) => { this.log('chat', `[${u} → Cloud] ${m}`); this.think(`Player ${u} whispered to you: ${m}`); });
    bot.on('message', (j, pos) => { if (pos === 'system') { const t = j.toString(); if (t.trim()) this.log('server', t.slice(0, 300)); } });
    let authDone = {};
    bot.on('messagestr', m => { // تسجيل/دخول تلقائي (AuthMe وما شابه)
      const pw = srv.password || process.env.CLOUD_PASSWORD || 'Cloud@12345';
      if (/\/register/i.test(m) && !authDone.r) { authDone.r = 1; setTimeout(() => bot.chat(`/register ${pw} ${pw}`), 1500); this.log('system', 'Auto /register'); }
      else if (/\/login/i.test(m) && !authDone.l) { authDone.l = 1; setTimeout(() => bot.chat(`/login ${pw}`), 1500); this.log('system', 'Auto /login'); }
    });
    bot.on('health', () => this.emit('state'));
    bot.on('kicked', r => this.log('error', `Kicked: ${JSON.stringify(r).slice(0, 300)}`));
    bot.on('error', e => this.log('error', e.message));
    bot.on('end', () => {
      this.log('system', 'Disconnected'); this.bot = null; this.emit('state');
      if (this.want) { clearTimeout(this.rt); this.rt = setTimeout(() => this.want && this.connect(srv), 15000); }
    });
  }
  disconnect() { this.want = false; clearTimeout(this.rt); try { this.bot?.quit(); } catch {} this.bot = null; }

  async learn() {
    const b = this.bot; this.db.set('players', Object.keys(b.players).join(','));
    this.db.set('gamemode', b.game?.gameMode || '');
    try { const c = await b.tabComplete('/'); this.db.set('commands', c.map(x => x.match || x).slice(0, 300).join(' ')); } catch {}
    this.log('system', 'Server info saved');
  }
  state() {
    const b = this.bot;
    return { connected: !!b?.entity, server: this.srv, brain: this.enabled, apiOk: this.apiOk, task: this.task, busy: this.busy,
      version: b?.version, pos: b?.entity && Object.fromEntries(['x', 'y', 'z'].map(k => [k, Math.round(b.entity.position[k])])),
      health: b?.health, food: b?.food, players: b ? Object.keys(b.players) : [],
      inventory: b ? b.inventory.items().map(i => `${i.name} x${i.count}`) : [] };
  }
  system() {
    const mem = this.db ? JSON.stringify(this.db.all()) : '{}';
    return `You are Cloud, an AI assistant playing Minecraft through a real bot. If asked, say plainly that you are an AI, not a human.
Rules: follow the server's rules and staff; never cheat, exploit, bypass protection or anti-cheat; don't spam (max one short message per turn); reply to players in their language; act on tasks without asking for each step.
Persona: ${this.db?.get('persona') || 'friendly, helpful, concise'}.
Notes saved for this server only: ${mem}`;
  }
  async think(trigger) {
    if (!this.enabled || !this.bot) return;
    if (this.busy) { this.pending.push(trigger); this.pending = this.pending.slice(-5); return; }
    this.busy = true; this.emit('state');
    try {
      const messages = [{ role: 'user', content: `${trigger}\n\nState: ${JSON.stringify({ ...this.state(), server: undefined })}` }];
      for (let i = 0; i < 8; i++) {
        const r = await this.ai.messages.create({ model: this.model, max_tokens: 1000, system: this.system(), tools: TOOLS, messages });
        this.apiOk = true; messages.push({ role: 'assistant', content: r.content });
        const uses = r.content.filter(c => c.type === 'tool_use'); if (!uses.length) break;
        const results = [];
        for (const u of uses) {
          let out; try { out = await this.run(u.name, u.input); } catch (e) { out = 'error: ' + e.message; }
          this.log('action', `${u.name} ${JSON.stringify(u.input)} → ${String(out).slice(0, 150)}`);
          results.push({ type: 'tool_result', tool_use_id: u.id, content: String(out ?? 'ok') });
        }
        messages.push({ role: 'user', content: results });
      }
    } catch (e) { this.apiOk = false; this.log('error', 'Claude API: ' + e.message); }
    finally { this.busy = false; this.emit('state'); const n = this.pending.shift(); if (n) this.think(n); }
  }
  async run(name, a) {
    const b = this.bot, d = require('minecraft-data')(b.version);
    const { GoalNear } = goals;
    switch (name) {
      case 'say': if (Date.now() - this.lastSay < 2500) return 'rate limited'; this.lastSay = Date.now(); b.chat(String(a.text).slice(0, 200)); this.log('chat', `<Cloud> ${a.text}`); return 'sent';
      case 'whisper': b.chat(`/msg ${a.to} ${String(a.text).slice(0, 200)}`); return 'sent';
      case 'goto': b.pathfinder.setMovements(new Movements(b)); await b.pathfinder.goto(new GoalNear(a.x, a.y, a.z, 1)); return 'arrived';
      case 'collect': {
        const blk = d.blocksByName[a.block]; if (!blk) return 'unknown block';
        const ids = b.findBlocks({ matching: blk.id, maxDistance: 48, count: a.count || 1 });
        if (!ids.length) return 'none nearby'; b.pathfinder.setMovements(new Movements(b));
        await b.collectBlock.collect(ids.map(p => b.blockAt(p))); return `collected ${ids.length}`;
      }
      case 'craft': {
        const it = d.itemsByName[a.item]; if (!it) return 'unknown item';
        const table = b.findBlock({ matching: d.blocksByName.crafting_table.id, maxDistance: 32 });
        const rec = b.recipesFor(it.id, null, 1, table)[0]; if (!rec) return 'no recipe / missing materials';
        await b.craft(rec, a.count || 1, table); return 'crafted';
      }
      case 'equip': { const it = b.inventory.items().find(i => i.name === a.item); if (!it) return 'not in inventory'; await b.equip(it, 'hand'); return 'equipped'; }
      case 'attack': { const e = Object.values(b.entities).find(x => (x.username || x.name) === a.target); if (!e) return 'target not found'; b.pvp.attack(e); return 'attacking'; }
      case 'stop': b.pvp.stop(); b.pathfinder.stop(); return 'stopped';
      case 'look_around': return JSON.stringify(Object.values(b.entities).filter(e => e !== b.entity && e.position.distanceTo(b.entity.position) < 24).map(e => `${e.username || e.name}@${e.position.floored()}`).slice(0, 30));
      case 'inventory': return this.state().inventory.join(', ') || 'empty';
      case 'run_command': b.chat(String(a.command).startsWith('/') ? a.command : '/' + a.command); return 'sent';
      case 'remember': this.db.set(a.key, a.value); return 'saved';
      case 'set_task': this.task = a.task; this.db.set('task', a.task); this.emit('state'); return 'ok';
    }
    return 'unknown tool';
  }
  command(text) { this.log('chat', `[owner → Cloud] ${text}`); return this.think(`Your owner (dashboard) says: ${text}`); }
}


const cloud = new Cloud();
const app = express();
const PW = process.env.DASHBOARD_PASSWORD;
if (PW) app.use((q, r, n) => { const [u, p] = Buffer.from((q.headers.authorization || '').slice(6), 'base64').toString().split(':'); if (p === PW) return n(); r.set('WWW-Authenticate', 'Basic realm="Cloud"').status(401).end(); }); app.use(express.json()); app.get('/', (_, r) => r.type('html').send(HTML));
const http = createServer(app); const wss = new WebSocketServer({ server: http });
const send = (type, data) => wss.clients.forEach(c => c.readyState === 1 && c.send(JSON.stringify({ type, data })));
cloud.on('log', l => send('log', l)); cloud.on('state', () => send('state', cloud.state()));
setInterval(() => send('state', cloud.state()), 3000);
wss.on('connection', ws => { ws.send(JSON.stringify({ type: 'state', data: cloud.state() })); ws.send(JSON.stringify({ type: 'servers', data: listServers() })); cloud.db?.recent().forEach(l => ws.send(JSON.stringify({ type: 'log', data: l }))); });

const find = id => listServers().find(s => s.id === id);
app.get('/api/servers', (_, r) => r.json(listServers()));
app.post('/api/servers', (q, r) => { // تأكيد الملكية/الإذن إلزامي
  const { name, host, port = 25565, version = '', password = '', authorized } = q.body;
  if (!authorized || !name || !host) return r.status(400).json({ error: 'name, host and authorized=true required' });
  const s = [...listServers(), { id: randomUUID().slice(0, 8), name, host, port: +port, version, password }]; saveServers(s); send('servers', s); r.json(s);
});
app.delete('/api/servers/:id', (q, r) => { const s = listServers().filter(x => x.id !== q.params.id); saveServers(s); send('servers', s); r.json(s); });
app.post('/api/start', (_, r) => { cloud.start(); r.json({}); });
app.post('/api/stop', (_, r) => { cloud.stop(); r.json({}); });
app.post('/api/connect', (q, r) => { const s = find(q.body.id); if (!s) return r.status(404).json({}); cloud.connect(s); r.json({}); });
app.post('/api/disconnect', (_, r) => { cloud.disconnect(); r.json({}); });
app.post('/api/command', (q, r) => { cloud.command(String(q.body.text || '')); r.json({}); });
http.listen(process.env.PORT || 3000, process.env.PORT ? '0.0.0.0' : '127.0.0.1', () => console.log(`Cloud Control: http://127.0.0.1:${process.env.PORT || 3000}`));
