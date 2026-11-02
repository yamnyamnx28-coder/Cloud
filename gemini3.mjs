import Database from 'better-sqlite3';
import fs from 'node:fs';
import { EventEmitter } from 'node:events';
import { createRequire } from 'node:module';
import mineflayer from 'mineflayer';
import express from 'express';
import { createServer } from 'node:http';
import { WebSocketServer } from 'ws';
import { randomUUID } from 'node:crypto';
const HTML = Buffer.from('PCFkb2N0eXBlIGh0bWw+PGh0bWwgbGFuZz0iYXIiIGRpcj0icnRsIj48aGVhZD48bWV0YSBjaGFyc2V0PSJ1dGYtOCI+PG1ldGEgbmFtZT0idmlld3BvcnQiIGNvbnRlbnQ9IndpZHRoPWRldmljZS13aWR0aCxpbml0aWFsLXNjYWxlPTEiPgo8dGl0bGU+Q2xvdWQgQ29udHJvbDwvdGl0bGU+CjxsaW5rIGhyZWY9Imh0dHBzOi8vZm9udHMuZ29vZ2xlYXBpcy5jb20vY3NzMj9mYW1pbHk9SUJNK1BsZXgrU2FucytBcmFiaWM6d2dodEA0MDA7NjAwOzcwMCZkaXNwbGF5PXN3YXAiIHJlbD0ic3R5bGVzaGVldCI+CjxzdHlsZT4KOnJvb3R7LS1iZzojRUVGM0Y3Oy0taW5rOiMxMDI0M0E7LS1tdXRlOiM1QjZFODA7LS1saW5lOiNDRkRBRTQ7LS1jYXJkOiNmZmY7LS1hYzojMEU3Qzg2Oy0td2FybjojQzAzOTJCfQoqe2JveC1zaXppbmc6Ym9yZGVyLWJveH1ib2R5e21hcmdpbjowO2JhY2tncm91bmQ6dmFyKC0tYmcpO2NvbG9yOnZhcigtLWluayk7Zm9udDoxNXB4LzEuNiAiSUJNIFBsZXggU2FucyBBcmFiaWMiLHN5c3RlbS11aSxzYW5zLXNlcmlmfQpoZWFkZXJ7cGFkZGluZzoyNHB4IDIwcHggOHB4O2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpiYXNlbGluZTtnYXA6MTRweDtmbGV4LXdyYXA6d3JhcH0KaDF7bWFyZ2luOjA7Zm9udC1zaXplOjQ0cHg7bGluZS1oZWlnaHQ6MTtmb250LXdlaWdodDo3MDA7bGV0dGVyLXNwYWNpbmc6LTFweH1oMSBzbWFsbHtmb250LXNpemU6MTVweDtjb2xvcjp2YXIoLS1tdXRlKTtmb250LXdlaWdodDo0MDA7bWFyZ2luLWlubGluZS1zdGFydDoxMHB4fQptYWlue2Rpc3BsYXk6Z3JpZDtncmlkLXRlbXBsYXRlLWNvbHVtbnM6MzQwcHggMWZyO2dhcDoxNnB4O3BhZGRpbmc6MTJweCAyMHB4IDI0cHh9QG1lZGlhKG1heC13aWR0aDo4MjBweCl7bWFpbntncmlkLXRlbXBsYXRlLWNvbHVtbnM6MWZyfX0Kc2VjdGlvbntiYWNrZ3JvdW5kOnZhcigtLWNhcmQpO2JvcmRlcjoxcHggc29saWQgdmFyKC0tbGluZSk7Ym9yZGVyLXJhZGl1czo2cHg7cGFkZGluZzoxNHB4IDE2cHg7bWFyZ2luLWJvdHRvbToxMnB4fQpoMnttYXJnaW46MCAwIDhweDtmb250LXNpemU6MTVweDtmb250LXdlaWdodDo2MDB9CmJ1dHRvbntmb250OmluaGVyaXQ7Ym9yZGVyOjFweCBzb2xpZCB2YXIoLS1pbmspO2JhY2tncm91bmQ6dmFyKC0taW5rKTtjb2xvcjojZmZmO2JvcmRlci1yYWRpdXM6NHB4O3BhZGRpbmc6NnB4IDEycHg7Y3Vyc29yOnBvaW50ZXJ9CmJ1dHRvbi5ve2JhY2tncm91bmQ6I2ZmZjtjb2xvcjp2YXIoLS1pbmspfWJ1dHRvbjpmb2N1cy12aXNpYmxlLGlucHV0OmZvY3VzLXZpc2libGUsc2VsZWN0OmZvY3VzLXZpc2libGV7b3V0bGluZTozcHggc29saWQgdmFyKC0tYWMpO291dGxpbmUtb2Zmc2V0OjJweH0KaW5wdXQsc2VsZWN0e2ZvbnQ6aW5oZXJpdDtib3JkZXI6MXB4IHNvbGlkIHZhcigtLWxpbmUpO2JvcmRlci1yYWRpdXM6NHB4O3BhZGRpbmc6NnB4IDhweDt3aWR0aDoxMDAlO21hcmdpbi1ib3R0b206NnB4O2JhY2tncm91bmQ6I2ZmZn0KLnJvd3tkaXNwbGF5OmZsZXg7Z2FwOjZweDtmbGV4LXdyYXA6d3JhcH0ucm93Pip7ZmxleDoxfS5kb3R7ZGlzcGxheTppbmxpbmUtYmxvY2s7d2lkdGg6OXB4O2hlaWdodDo5cHg7Ym9yZGVyLXJhZGl1czo1MCU7YmFja2dyb3VuZDp2YXIoLS13YXJuKTttYXJnaW4taW5saW5lLWVuZDo2cHh9LmRvdC5vbntiYWNrZ3JvdW5kOnZhcigtLWFjKX0KLmJhcntoZWlnaHQ6OHB4O2JhY2tncm91bmQ6dmFyKC0tbGluZSk7Ym9yZGVyLXJhZGl1czo0cHg7b3ZlcmZsb3c6aGlkZGVuO21hcmdpbjoycHggMCA4cHh9LmJhciBpe2Rpc3BsYXk6YmxvY2s7aGVpZ2h0OjEwMCU7YmFja2dyb3VuZDp2YXIoLS1hYyl9LmJhci5mIGl7YmFja2dyb3VuZDojQjk4MzFDfQojbG9ne2hlaWdodDo0MjBweDtvdmVyZmxvdzphdXRvO2ZvbnQtc2l6ZToxM3B4O2JhY2tncm91bmQ6I0Y4RkJGRDtib3JkZXI6MXB4IHNvbGlkIHZhcigtLWxpbmUpO2JvcmRlci1yYWRpdXM6NHB4O3BhZGRpbmc6OHB4fQojbG9nIGRpdntwYWRkaW5nOjFweCAwfS5rLWNoYXR7Y29sb3I6dmFyKC0taW5rKX0uay1hY3Rpb257Y29sb3I6dmFyKC0tYWMpfS5rLWVycm9ye2NvbG9yOnZhcigtLXdhcm4pfS5rLXN5c3RlbSwuay1zZXJ2ZXIsLmstYXV0aHtjb2xvcjp2YXIoLS1tdXRlKX0uay1hdXRoe2ZvbnQtd2VpZ2h0OjYwMDtjb2xvcjp2YXIoLS1pbmspfQp1bHttYXJnaW46MDtwYWRkaW5nLWlubGluZS1zdGFydDoxOHB4O2NvbG9yOnZhcigtLW11dGUpfQoucnd7ZGlzcGxheTpncmlkO2dyaWQtdGVtcGxhdGUtY29sdW1uczpyZXBlYXQoOSwxZnIpO2dhcDozcHg7bWFyZ2luLWJvdHRvbTozcHh9LnJ3Lmd7bWFyZ2luLXRvcDo4cHh9LnNse2FzcGVjdC1yYXRpbzoxO2JvcmRlcjoxcHggc29saWQgdmFyKC0tbGluZSk7YmFja2dyb3VuZDojRjhGQkZEO2JvcmRlci1yYWRpdXM6M3B4O3Bvc2l0aW9uOnJlbGF0aXZlO2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7anVzdGlmeS1jb250ZW50OmNlbnRlcjtjdXJzb3I6cG9pbnRlcjtvdmVyZmxvdzpoaWRkZW59LnNsIGltZ3t3aWR0aDo4MCU7aGVpZ2h0OjgwJTtpbWFnZS1yZW5kZXJpbmc6cGl4ZWxhdGVkfS5zbCBzbWFsbHtmb250LXNpemU6OHB4O2xpbmUtaGVpZ2h0OjE7dGV4dC1hbGlnbjpjZW50ZXI7Y29sb3I6dmFyKC0tbXV0ZSl9LnNsIGJ7cG9zaXRpb246YWJzb2x1dGU7Ym90dG9tOjA7aW5zZXQtaW5saW5lLWVuZDoycHg7Zm9udC1zaXplOjExcHh9LnNsLm9ue291dGxpbmU6M3B4IHNvbGlkIHZhcigtLWFjKX0KPC9zdHlsZT48L2hlYWQ+PGJvZHk+CjxoZWFkZXI+PGgxPkNsb3VkPHNtYWxsPkNsb3VkIENvbnRyb2wgwrcgWUFNRU4gQUkgTUlORUNSQUZUPC9zbWFsbD48L2gxPjwvaGVhZGVyPgo8bWFpbj48ZGl2Pgo8c2VjdGlvbj48aDI+2KfZhNit2KfZhNipPC9oMj48ZGl2PjxzcGFuIGNsYXNzPSJkb3QiIGlkPSJkIj48L3NwYW4+PHNwYW4gaWQ9InN0Ij7igJQ8L3NwYW4+PC9kaXY+CjxkaXYgaWQ9InNydiIgc3R5bGU9ImNvbG9yOnZhcigtLW11dGUpIj48L2Rpdj48ZGl2IGlkPSJwb3MiIHN0eWxlPSJjb2xvcjp2YXIoLS1tdXRlKSI+PC9kaXY+CjxkaXYgY2xhc3M9InJvdyIgc3R5bGU9Im1hcmdpbi10b3A6OHB4Ij48YnV0dG9uIGlkPSJzdGFydCI+2KrYtNi62YrZhCBDbG91ZDwvYnV0dG9uPjxidXR0b24gY2xhc3M9Im8iIGlkPSJzdG9wIj7YpdmK2YLYp9mBPC9idXR0b24+PC9kaXY+CjxkaXYgaWQ9ImFwaSIgc3R5bGU9Im1hcmdpbi10b3A6OHB4O2NvbG9yOnZhcigtLW11dGUpIj48L2Rpdj48L3NlY3Rpb24+CjxzZWN0aW9uPjxoMj7Yp9mE2LXYrdipINmI2KfZhNi32LnYp9mFPC9oMj7Yp9mE2LXYrdipIDxiIGlkPSJocCI+LTwvYj48ZGl2IGNsYXNzPSJiYXIiPjxpIGlkPSJocGIiPjwvaT48L2Rpdj7Yp9mE2LfYudin2YUgPGIgaWQ9ImZkIj4tPC9iPjxkaXYgY2xhc3M9ImJhciBmIj48aSBpZD0iZmRiIj48L2k+PC9kaXY+PC9zZWN0aW9uPgo8c2VjdGlvbj48aDI+2KfZhNmF2YfZhdipINin2YTYrdin2YTZitipPC9oMj48ZGl2IGlkPSJ0YXNrIj7ZhNinINiq2YjYrNivINmF2YfZhdipPC9kaXY+PC9zZWN0aW9uPgo8c2VjdGlvbj48aDI+2KfZhNmF2K7YstmI2YY8L2gyPjxkaXYgaWQ9ImludiI+PC9kaXY+CjxkaXYgY2xhc3M9InJvdyIgc3R5bGU9Im1hcmdpbi10b3A6OHB4Ij48YnV0dG9uIGNsYXNzPSJvIiBvbmNsaWNrPSJpYSgnaGFuZCcpIj7Yp9mF2LPZg9mHPC9idXR0b24+PGJ1dHRvbiBjbGFzcz0ibyIgb25jbGljaz0iaWEoJ29mZicpIj7ZitivINir2KfZhtmK2Kk8L2J1dHRvbj48YnV0dG9uIGNsYXNzPSJvIiBvbmNsaWNrPSJpYSgnYXJtb3InKSI+2KfZhNio2LPZhzwvYnV0dG9uPjxidXR0b24gY2xhc3M9Im8iIG9uY2xpY2s9ImlhKCdkcm9wMScpIj7Yp9ix2YXZkCDZiNin2K3YrzwvYnV0dG9uPjxidXR0b24gY2xhc3M9Im8iIG9uY2xpY2s9ImlhKCdkcm9wQWxsJykiPtin2LHZhdmQINin2YTZg9mEPC9idXR0b24+PC9kaXY+CjxkaXYgc3R5bGU9ImNvbG9yOnZhcigtLW11dGUpO2ZvbnQtc2l6ZToxM3B4O21hcmdpbi10b3A6NnB4Ij7Yp9i22LrYtyDYrtin2YbYqSDZhNin2K7YqtmK2KfYsdmH2KfYjCDYq9mFINin2LbYuti3INiu2KfZhtipINir2KfZhtmK2Kkg2YTZhtmC2YQg2KfZhNi62LHYtiDYpdmE2YrZh9in2Iwg2KPZiCDYp9iz2KrYrtiv2YUg2KfZhNij2LLYsdin2LEuPC9kaXY+PC9zZWN0aW9uPgo8c2VjdGlvbj48aDI+2KfZhNiz2YrYsdmB2LHYp9iqPC9oMj48c2VsZWN0IGlkPSJzZWwiPjwvc2VsZWN0Pgo8ZGl2IGNsYXNzPSJyb3ciPjxidXR0b24gaWQ9ImNvbiI+2KfYqti12KfZhDwvYnV0dG9uPjxidXR0b24gY2xhc3M9Im8iIGlkPSJkaXMiPtmC2LfYuSDYp9mE2KfYqti12KfZhDwvYnV0dG9uPjxidXR0b24gY2xhc3M9Im8iIGlkPSJkZWwiPtit2LDZgSDYp9mE2LPZitix2YHYsTwvYnV0dG9uPjwvZGl2Pgo8ZGV0YWlscyBzdHlsZT0ibWFyZ2luLXRvcDo4cHgiPjxzdW1tYXJ5Ptil2LbYp9mB2Kkg2LPZitix2YHYsTwvc3VtbWFyeT4KPGlucHV0IGlkPSJuIiBwbGFjZWhvbGRlcj0i2KfYs9mFINin2YTYs9mK2LHZgdixIj48aW5wdXQgaWQ9ImgiIHBsYWNlaG9sZGVyPSLYp9mE2LnZhtmI2KfZhiAoSVApIj48aW5wdXQgaWQ9InAiIHBsYWNlaG9sZGVyPSLYp9mE2YXZhtmB2LAiIHZhbHVlPSIyNTU2NSI+PGlucHV0IGlkPSJ2IiBwbGFjZWhvbGRlcj0i2KfZhNil2LXYr9in2LEgKNin2K7YqtmK2KfYsdmKKSI+PGlucHV0IGlkPSJwdyIgcGxhY2Vob2xkZXI9ItmD2YTZhdipINiz2LEg2YTZhNiq2LPYrNmK2YQgL3JlZ2lzdGVyICjYp9iu2KrZitin2LHZiikiPgo8bGFiZWw+PGlucHV0IHR5cGU9ImNoZWNrYm94IiBpZD0iYSIgc3R5bGU9IndpZHRoOmF1dG8iPiDYo9mF2YTZgyDZh9iw2Kcg2KfZhNiz2YrYsdmB2LEg2KPZiCDYudmG2K/ZiiDYpdiw2YYg2KjYp9mE2K/YrtmI2YQ8L2xhYmVsPjxidXR0b24gaWQ9ImFkZCIgc3R5bGU9Im1hcmdpbi10b3A6NnB4Ij7YrdmB2Lg8L2J1dHRvbj48L2RldGFpbHM+PC9zZWN0aW9uPgo8L2Rpdj48ZGl2Pgo8c2VjdGlvbj48aDI+2KfZhNi02KfYqiDZiNiz2KzZhCDYp9mE2KPYudmF2KfZhDwvaDI+PGRpdiBpZD0ibG9nIj48L2Rpdj4KPGRpdiBjbGFzcz0icm93IiBzdHlsZT0ibWFyZ2luLXRvcDo4cHgiPjxpbnB1dCBpZD0iY21kIiBwbGFjZWhvbGRlcj0i2KfZg9iq2Kgg2LHYs9in2YTYqdiMINij2Yg6IGdvdG8geCB5IHog2IwgY29sbGVjdCBvYWtfbG9nIDUg2IwgL9ij2YXYsSIgc3R5bGU9ImZsZXg6NDttYXJnaW46MCI+PGJ1dHRvbiBpZD0ic2VuZCI+2KXYsdiz2KfZhDwvYnV0dG9uPjwvZGl2Pjwvc2VjdGlvbj4KPHNlY3Rpb24+PGgyPtij2LHYtNmK2YEg2KfZhNij2YjYp9mF2LEg2YjYp9mE2YXYudmE2YjZhdin2Ko8L2gyPjxkaXYgc3R5bGU9ImNvbG9yOnZhcigtLW11dGUpIj7Zg9mEINiz2YrYsdmB2LEg2YTZhyDZgtin2LnYr9ipINio2YrYp9mG2KfYqiDZhdmG2YHYtdmE2Kkg2K/Yp9iu2YQgZGF0YS9zZXJ2ZXJzLzwvZGl2Pjwvc2VjdGlvbj4KPC9kaXY+PC9tYWluPgo8c2NyaXB0Pgpjb25zdCAkPWk9PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGkpLGFwaT0ocCxiKT0+ZmV0Y2goJy9hcGkvJytwLHttZXRob2Q6J1BPU1QnLGhlYWRlcnM6eydDb250ZW50LVR5cGUnOidhcHBsaWNhdGlvbi9qc29uJ30sYm9keTpKU09OLnN0cmluZ2lmeShifHx7fSl9KTsKJCgnc3RhcnQnKS5vbmNsaWNrPSgpPT5hcGkoJ3N0YXJ0Jyk7JCgnc3RvcCcpLm9uY2xpY2s9KCk9PmFwaSgnc3RvcCcpOyQoJ2RpcycpLm9uY2xpY2s9KCk9PmFwaSgnZGlzY29ubmVjdCcpOyQoJ2NvbicpLm9uY2xpY2s9KCk9PmFwaSgnY29ubmVjdCcse2lkOiQoJ3NlbCcpLnZhbHVlfSk7CiQoJ2FkZCcpLm9uY2xpY2s9KCk9PmFwaSgnc2VydmVycycse25hbWU6JCgnbicpLnZhbHVlLGhvc3Q6JCgnaCcpLnZhbHVlLHBvcnQ6JCgncCcpLnZhbHVlLHZlcnNpb246JCgndicpLnZhbHVlLHBhc3N3b3JkOiQoJ3B3JykudmFsdWUsYXV0aG9yaXplZDokKCdhJykuY2hlY2tlZH0pLnRoZW4ocj0+ci5va3x8YWxlcnQoJ9ij2YPZkdivINin2YTYpdiw2YYg2YjYp9mF2YTYoyDYp9mE2KfYs9mFINmI2KfZhNi52YbZiNin2YYnKSk7CmNvbnN0IHNlbmQ9KCk9PntpZigkKCdjbWQnKS52YWx1ZS50cmltKCkpe2FwaSgnY29tbWFuZCcse3RleHQ6JCgnY21kJykudmFsdWV9KTskKCdjbWQnKS52YWx1ZT0nJ319OyQoJ3NlbmQnKS5vbmNsaWNrPXNlbmQ7JCgnY21kJykub25rZXlkb3duPWU9PmUua2V5PT09J0VudGVyJyYmc2VuZCgpOwpjb25zdCB3cz1uZXcgV2ViU29ja2V0KChsb2NhdGlvbi5wcm90b2NvbD09PSdodHRwczonPyd3c3M6Ly8nOid3czovLycpK2xvY2F0aW9uLmhvc3QpOwp3cy5vbm1lc3NhZ2U9ZT0+e2NvbnN0e3R5cGUsZGF0YX09SlNPTi5wYXJzZShlLmRhdGEpOwppZih0eXBlPT09J2xvZycpe2NvbnN0IGQ9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7ZC5jbGFzc05hbWU9J2stJytkYXRhLmtpbmQ7ZC50ZXh0Q29udGVudD1uZXcgRGF0ZShkYXRhLnQpLnRvTG9jYWxlVGltZVN0cmluZygpKycgICcrZGF0YS50ZXh0O2NvbnN0IGw9JCgnbG9nJyk7bC5hcHBlbmQoZCk7bC5zY3JvbGxUb3A9bC5zY3JvbGxIZWlnaHR9CmlmKHR5cGU9PT0nc2VydmVycycpJCgnc2VsJykuaW5uZXJIVE1MPWRhdGEubWFwKHM9PmA8b3B0aW9uIHZhbHVlPSIke3MuaWR9Ij4ke3MubmFtZX0gKCR7cy5ob3N0fToke3MucG9ydH0pPC9vcHRpb24+YCkuam9pbignJyk7CmlmKHR5cGU9PT0nc3RhdGUnKXtjb25zdCBzPWRhdGE7JCgnZCcpLmNsYXNzTmFtZT0nZG90Jysocy5jb25uZWN0ZWQ/JyBvbic6JycpOyQoJ3N0JykudGV4dENvbnRlbnQ9cy5jb25uZWN0ZWQ/J9mF2KrYtdmEJzon2LrZitixINmF2KrYtdmEJzsKJCgnc3J2JykudGV4dENvbnRlbnQ9cy5zZXJ2ZXI/YCR7cy5zZXJ2ZXIubmFtZX0gwrcgJHtzLnZlcnNpb258fCcnfSDCtyAke3MucGxheWVycy5sZW5ndGh9INmE2KfYudioYDonJzsKJCgncG9zJykudGV4dENvbnRlbnQ9cy5wb3M/YNin2YTZhdmI2YLYuTogJHtzLnBvcy54fSwgJHtzLnBvcy55fSwgJHtzLnBvcy56fWA6Jyc7CiQoJ2FwaScpLnRleHRDb250ZW50PSdDbGF1ZGUgQVBJOiAnKyhzLmFwaU9rPT09bnVsbD8n2YTZhSDZitmP2K7Yqtio2LEnOnMuYXBpT2s/J9mK2LnZhdmEJzon2K7Yt9ijJykrJyDCtyDYp9mE2LnZgtmEOiAnKyhzLmJyYWluPyhzLmJ1c3k/J9mK2YHZg9ixJzon2KzYp9mH2LInKTon2YXYqtmI2YLZgScpOwokKCdocCcpLnRleHRDb250ZW50PXMuaGVhbHRoPz8nLSc7JCgnaHBiJykuc3R5bGUud2lkdGg9KChzLmhlYWx0aHx8MCkvMjAqMTAwKSsnJSc7JCgnZmQnKS50ZXh0Q29udGVudD1zLmZvb2Q/PyctJzskKCdmZGInKS5zdHlsZS53aWR0aD0oKHMuZm9vZHx8MCkvMjAqMTAwKSsnJSc7CiQoJ3Rhc2snKS50ZXh0Q29udGVudD1zLnRhc2t8fCfZhNinINiq2YjYrNivINmF2YfZhdipJztyZW5kZXJJbnYocy5zbG90c3x8W10pfX07CiQoJ2RlbCcpLm9uY2xpY2s9KCk9Pntjb25zdCB2PSQoJ3NlbCcpLnZhbHVlO2lmKHYmJmNvbmZpcm0oJ9iq2K3YsNmBINmH2KfYryDYp9mE2LPZitix2YHYsdifJykpZmV0Y2goJy9hcGkvc2VydmVycy8nK3Yse21ldGhvZDonREVMRVRFJ30pfTsKbGV0IHNlbD1udWxsLGxhc3Q9W107Y29uc3QgSUM9J2h0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9QcmlzbWFyaW5lSlMvbWluZWNyYWZ0LWFzc2V0cy9tYXN0ZXIvZGF0YS8xLjIwLjIvJzsKZnVuY3Rpb24gY2VsbChpLHMpe2NvbnN0IGQ9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7ZC5jbGFzc05hbWU9J3NsJysoc2VsPT09aT8nIG9uJzonJyk7ZC5vbmNsaWNrPSgpPT5waWNrKGkpO2NvbnN0IGl0PXNbaV07CmlmKGl0KXtjb25zdCBubT1pdC5uLnJlcGxhY2UoL18vZywnICcpO2QudGl0bGU9bm07Y29uc3QgaW09bmV3IEltYWdlKCk7aW0uc3JjPUlDKydpdGVtcy8nK2l0Lm4rJy5wbmcnOwppbS5vbmVycm9yPSgpPT57aW0ub25lcnJvcj0oKT0+e2ltLnJlbW92ZSgpO2NvbnN0IHQ9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc21hbGwnKTt0LnRleHRDb250ZW50PW5tO2QucHJlcGVuZCh0KX07aW0uc3JjPUlDKydibG9ja3MvJytpdC5uKycucG5nJ307ZC5hcHBlbmQoaW0pOwppZihpdC5jPjEpe2NvbnN0IGI9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYicpO2IudGV4dENvbnRlbnQ9aXQuYztkLmFwcGVuZChiKX19cmV0dXJuIGR9CmZ1bmN0aW9uIHJlbmRlckludihzKXtsYXN0PXM7Y29uc3QgZz0kKCdpbnYnKTtnLmlubmVySFRNTD0nJztjb25zdCBSPShhLGIpPT5BcnJheS5mcm9tKHtsZW5ndGg6Yi1hKzF9LChfLGspPT5hK2spOwpbWzUsNiw3LDgsNDVdLFIoOSwxNyksUigxOCwyNiksUigyNywzNSksUigzNiw0NCldLmZvckVhY2goKHIsbik9Pntjb25zdCB3PWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO3cuY2xhc3NOYW1lPSdydycrKG49PT00PycgZyc6JycpO3IuZm9yRWFjaChpPT53LmFwcGVuZChjZWxsKGksbGFzdCkpKTtnLmFwcGVuZCh3KX0pfQpmdW5jdGlvbiBwaWNrKGkpe2lmKHNlbD09PW51bGwpe2lmKGxhc3RbaV0pc2VsPWl9ZWxzZXtpZihzZWwhPT1pKWFwaSgnaW52Jyx7b3A6J21vdmUnLHNsb3Q6c2VsLHRvOml9KTtzZWw9bnVsbH1yZW5kZXJJbnYobGFzdCl9CmZ1bmN0aW9uIGlhKG9wKXtpZihzZWw9PT1udWxsKXJldHVybiBhbGVydCgn2KfYrtiq2KfYsSDYrtin2YbYqSDYo9mI2YQnKTthcGkoJ2ludicse29wLHNsb3Q6c2VsfSk7c2VsPW51bGw7cmVuZGVySW52KGxhc3QpfQo8L3NjcmlwdD48L2JvZHk+PC9odG1sPgo=', 'base64').toString();
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
    this.model = process.env.CLAUDE_MODEL || 'claude-sonnet-4-6';
    this.enabled = false; this.busy = false; this.pending = []; this.task = ''; this.apiOk = null; this.lastSay = 0;
    setInterval(() => { if (this.enabled && this.bot && this.task && !this.busy) this.think('Continue the current task with the next concrete steps.'); }, 60000);
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
    bot.once('spawn', () => { bot.inventory.on('updateSlot', () => { clearTimeout(this._st); this._st = setTimeout(() => this.emit('state'), 300); }); this.log('system', `Joined (version ${bot.version})`); this.db.set('version', bot.version); this.learn(); });
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
      slots: b?.inventory ? b.inventory.slots.map(i => i ? { n: i.name, c: i.count } : null) : [],
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
    const key = process.env.GEMINI_API_KEY;
    if (!this.enabled || !this.bot) return;
    if (!key) return this.log('error', 'GEMINI_API_KEY غير موجود');
    if (this.busy) { this.pending.push(trigger); this.pending = this.pending.slice(-3); return; }
    this.busy = true; this.emit('state');
    const fd = TOOLS.map(t => {
      const p = t.input_schema.properties, req = t.input_schema.required;
      const d = { name: t.name, description: t.description };
      if (Object.keys(p).length) d.parameters = { type: 'OBJECT', properties: Object.fromEntries(Object.entries(p).map(([k, v]) => [k, { type: v.type.toUpperCase() }])), ...(req.length ? { required: req } : {}) };
      return d;
    });
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL || 'gemini-flash-latest'}:generateContent?key=${key}`;
    try {
      const contents = [{ role: 'user', parts: [{ text: `${trigger}\n\nState: ${JSON.stringify({ ...this.state(), server: undefined })}` }] }];
      for (let i = 0; i < 6; i++) {
        const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ systemInstruction: { parts: [{ text: this.system() + ' Use the say tool to talk in chat.' }] }, contents, tools: [{ functionDeclarations: fd }] }) });
        const j = await r.json(); if (!r.ok) throw new Error(j.error?.message || r.status);
        this.apiOk = true;
        const parts = j.candidates?.[0]?.content?.parts || [];
        contents.push({ role: 'model', parts });
        const calls = parts.filter(p => p.functionCall); if (!calls.length) break;
        const res = [];
        for (const c of calls) {
          const { name, args = {} } = c.functionCall; let out;
          try { out = await this.run(name, args); } catch (e) { out = 'error: ' + e.message; }
          this.log('action', `${name} ${JSON.stringify(args)} → ${String(out).slice(0, 150)}`);
          res.push({ functionResponse: { name, response: { result: String(out ?? 'ok') } } });
        }
        contents.push({ role: 'user', parts: res });
      }
    } catch (e) { this.apiOk = false; this.log('error', 'Gemini: ' + e.message); }
    finally { this.busy = false; this.emit('state'); const n = this.pending.shift(); if (n) this.think(n); }
  }
  async thinkOld(trigger) {
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
  async inv(op, a) {
    const b = this.bot; if (!b?.entity) throw new Error('Cloud غير متصل');
    if (op === 'move') { await b.moveSlotItem(a.slot, a.to); return 'moved'; }
    const it = b.inventory.slots[a.slot]; if (!it) throw new Error('الخانة فاضية');
    if (op === 'hand') await b.equip(it, 'hand');
    else if (op === 'off') await b.equip(it, 'off-hand');
    else if (op === 'armor') {
      const n = it.name, d = /helmet|turtle_shell|_head$|skull/.test(n) ? 'head' : /chestplate|elytra/.test(n) ? 'torso' : /leggings/.test(n) ? 'legs' : /boots/.test(n) ? 'feet' : null;
      if (!d) throw new Error('هاد مش قطعة درع'); await b.equip(it, d);
    }
    else if (op === 'drop1') await b.toss(it.type, it.metadata, 1);
    else if (op === 'dropAll') await b.tossStack(it);
    else throw new Error('أمر غير معروف');
    this.log('action', `inventory ${op} ${it.name}`); return 'ok';
  }
  async command(text) {
    this.log('chat', `[owner] ${text}`);
    if (!this.bot) return this.log('error', 'Cloud غير متصل بسيرفر');
    const t = text.trim(), [c, ...a] = t.split(/\s+/); let out;
    try {
      if (t.startsWith('/')) out = await this.run('run_command', { command: t });
      else if (c === 'goto') out = await this.run('goto', { x: +a[0], y: +a[1], z: +a[2] });
      else if (c === 'collect') out = await this.run('collect', { block: a[0], count: +a[1] || 1 });
      else if (c === 'attack') out = await this.run('attack', { target: a[0] });
      else if (c === 'stop') out = await this.run('stop', {});
      else { await this.think(`Your owner says: ${t}`); return; }
    } catch (e) { out = 'error: ' + e.message; }
    this.log('action', `${t} → ${out}`);
  }
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
app.post('/api/inv', async (q, r) => { try { r.json({ ok: true, out: await cloud.inv(q.body.op, q.body) }); } catch (e) { cloud.log('error', 'inventory: ' + e.message); r.status(400).json({ error: e.message }); } });
http.listen(process.env.PORT || 3000, process.env.PORT ? '0.0.0.0' : '127.0.0.1', () => console.log(`Cloud Control: http://127.0.0.1:${process.env.PORT || 3000}`));

if (process.env.RENDER_EXTERNAL_URL) setInterval(() => fetch(process.env.RENDER_EXTERNAL_URL).catch(() => {}), 600000);
