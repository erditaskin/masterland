import { advance, cityRule, city, cityProducers, fresh, level, orders, product, producers, transition, type Save, type Action } from '../mobile/src/game/engine';
let now = 1700000000000, s = fresh(now), spent = 0;
const start = now;
function act(a: Action) {
 const result = transition(s, a, now, () => false);
 if (result.kind === 'blocked') throw Error(result.message);
 s = result.state; now += 300; return result;
}
function acquire(id: string): number {
 const p = product(id), c = city(s);
 const found = c.board.findIndex((v) => v?.item === id);
 if (found >= 0) return found;
 if (p.tier === 1) {
  const producer = producers[p.producer]!;
  const readyAt = c.batches[producer.id]?.readyAt ?? 0;
  if (s.stamina < 1 || readyAt > now) {
   now = Math.max(now, s.stamina < 1 ? s.energyAt + 120000 : now, readyAt); s = advance(s, now);
  }
  const result = act({type:'produce',id:producer.id});spent++;return result.to!;
 }
 const previous = producers[p.producer]!.products[p.tier - 2]!.id;
 const a = acquire(previous);
 // reserve first tile so the second request produces another copy
 const keep = city(s).board[a]!; city(s).board[a] = null;
 const b = acquire(previous);
 const free = city(s).board.indexOf(null); city(s).board[free] = keep;
 act({type:'move',from:free,to:b});return b;
}
const points: Record<number, unknown> = {};
while (level(s) < 30 && now - start < 12*86400000) {
 if (s.cityID === 'city1' && level(s) >= cityRule('city2')!.level && s.gold >= cityRule('city2')!.gold) act({type:'travel',id:'city2'});
 const firstProducer = producers.indexOf(cityProducers(s)[0]!);
 const candidates = orders(s).filter(o=>o.requirements.every(r=>product(r.item_id).producer === firstProducer));
 candidates.sort((a,b)=> b.xp/b.requirements.reduce((n,r)=>n+r.quantity*2**(product(r.item_id).tier-1),0)-a.xp/a.requirements.reduce((n,r)=>n+r.quantity*2**(product(r.item_id).tier-1),0));
 const order = candidates[0]!;
 for (const req of order.requirements) {
  while (city(s).board.filter(t=>t?.item===req.item_id).length < req.quantity) {
   // reserve existing targets while building the missing quantity
   const held=city(s).board.flatMap((t,i)=>t?.item===req.item_id?[[i,t] as const]:[]);
   held.forEach(([i])=>city(s).board[i]=null);
   acquire(req.item_id);
   held.forEach(([,t])=>{city(s).board[city(s).board.indexOf(null)]=t;});
  }
 }
 const oldLevel=level(s); act({type:'deliver',id:order.id});
 if(level(s)!==oldLevel) points[level(s)]={hours:+((now-start)/3600000).toFixed(2),xp:s.xp,gold:s.gold,energySpent:spent};
 s.rewardQueue=[];
}
console.log(JSON.stringify({policy:'continuous optimal low-tier farming; real city travel at current city2 rule; no gems or ads; 300ms actions; 120s refill; no optional producer spending',points},null,2));
