const products = [
  {id:'water',name:'Bình nước',emoji:'🧴',cost:2,price:'2 xu',oldPrice:'5 xu',slots:1,points:2,description:'Giá niêm yết 5 xu, hôm nay chỉ còn 2 xu.',effect:'Giá neo'},
  {id:'combo',name:'Combo “Tránh mưa”',emoji:'🌂',cost:3,price:'3 xu',slots:2,points:4,description:'Một combo gồm 1 áo mưa + 1 “áo mưa”.',effect:'Mua theo gói'},
  {id:'card',name:'Thiệp Noel',emoji:'💌',cost:1,price:'1 xu',slots:1,points:1,description:'Một món quà nhỏ, đơn giản và vừa túi tiền.',effect:'Lựa chọn tối giản'},
  {id:'blind',name:'Hộp mù',emoji:'🎁',cost:3,price:'3 xu',slots:2,points:4,description:'Một chiếc hộp bí ẩn đang chờ được mở.',effect:'Chim mồi'},
  {id:'vip',name:'Hộp mù VIP',emoji:'💎',cost:4,price:'4 xu',slots:2,points:6,description:'Thêm một xu để đổi lấy nhiều điểm hơn.',effect:'Định giá'},
  {id:'cookie',name:'Hộp Bánh Quy',emoji:'🍪',cost:2,price:'1,99 xu*',slots:1,points:2,description:'Giá 1,99 xu, thanh toán làm tròn thành 2 xu.',effect:'Giá lẻ'},
  {id:'bracelet',name:'Vòng tay',emoji:'📿',cost:3,price:'3 xu',slots:1,points:3,description:'Chỉ có đúng một chiếc trong phiên chợ.',effect:'Khan hiếm',limited:true}
];
const achievements = [
  {id:'pig',name:'Heo đất',emoji:'🐷',description:'Còn ít nhất 2 xu khi kết thúc',points:3},
  {id:'diamond',name:'Tài khoản kim cương',emoji:'💎',description:'Lấp đầy chính xác 9/9 ô túi',points:2},
  {id:'fast',name:'Nhanh như chớp',emoji:'⚡',description:'Đội đầu tiên hoàn thành mua sắm',points:2}
];

const $ = id => document.getElementById(id);
let teams=[], currentTeam=0, round=1, finalRound=false, finalQueue=[], finalQueueIndex=0;
let braceletAvailable=true, announced={pig:false,diamond:false,fast:false}, firstFinisher=null, gameOver=false;
let activity=[];

function renderTeamInputs(){
  const count=Math.max(2,Math.min(8,Number($('teamCount').value)||4));
  const previous=[...document.querySelectorAll('.team-name')].map(input=>input.value);
  $('teamCount').value=count;
  $('teamNames').innerHTML='';
  for(let i=0;i<count;i++){
    const input=document.createElement('input');
    input.className='team-name';input.maxLength=22;input.placeholder=`Tên đội ${i+1}`;
    input.value=previous[i]||`Đội ${i+1}`;
    $('teamNames').appendChild(input);
  }
}
$('teamCount').addEventListener('change',renderTeamInputs);
renderTeamInputs();

function addLog(message){
  activity.unshift(message);
  $('log').innerHTML=activity.slice(0,35).map(line=>`<p>${line}</p>`).join('');
}
function escapeHTML(value){
  return value.replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}
function canBuy(team){
  return products.some(product=>team.coins>=product.cost && team.slots+product.slots<=9 && (!product.limited||braceletAvailable));
}
function startGame(){
  const names=[...document.querySelectorAll('.team-name')].map((input,index)=>input.value.trim()||`Đội ${index+1}`);
  teams=names.map(name=>({name,coins:7,slots:0,items:[],itemPoints:0,achievementPoints:0,status:'waiting'}));
  currentTeam=0;round=1;finalRound=false;finalQueue=[];finalQueueIndex=0;
  braceletAvailable=true;announced={pig:false,diamond:false,fast:false};firstFinisher=null;gameOver=false;activity=[];
  $('setup').classList.add('hidden');$('game').classList.remove('hidden');$('results').classList.add('hidden');
  addLog('🎄 Cánh cửa phiên chợ đã mở. Chúc các đội mua sắm thật vui!');
  moveToNextPlayableTeam();
  render();
}
function markFinished(index,automatic=false){
  const team=teams[index];
  if(team.status==='done')return;
  team.status='done';
  if(firstFinisher===null){
    firstFinisher=index;
    if(announced.fast){team.achievementPoints+=2;addLog(`⚡ ${team.name} nhận 2 điểm thành tựu Nhanh như chớp!`);}
  }
  addLog(`${automatic?'⛔':'🏁'} ${team.name} ${automatic?'không còn món nào phù hợp':'đã quyết định dừng mua'}.`);
  if(!finalRound){
    finalRound=true;
    finalQueue=[];
    for(let offset=1;offset<teams.length;offset++){
      const indexInOrder=(index+offset)%teams.length;
      if(teams[indexInOrder].status!=='done')finalQueue.push(indexInOrder);
    }
    finalQueueIndex=0;
    if(finalQueue.length)addLog('🔔 Vòng cuối bắt đầu! Mỗi đội còn lại có thêm đúng một lượt.');
    else{finishGame();return;}
  }else{
    finalQueueIndex++;
  }
  moveToNextPlayableTeam();
}
function moveToNextPlayableTeam(){
  if(gameOver)return;
  if(!finalRound){
    let checked=0;
    while(checked<teams.length){
      const team=teams[currentTeam];
      if(team.status!=='done'&&!canBuy(team)){markFinished(currentTeam,true);return;}
      if(team.status!=='done')return;
      currentTeam=(currentTeam+1)%teams.length;
      if(currentTeam===0)round++;
      checked++;
    }
    finishGame();return;
  }
  while(finalQueueIndex<finalQueue.length){
    const candidate=finalQueue[finalQueueIndex];
    const team=teams[candidate];
    if(team.status!=='done'&&canBuy(team)){currentTeam=candidate;return;}
    if(team.status!=='done'){
      team.status='done';
      addLog(`⛔ ${team.name} không thể mua thêm trong lượt cuối.`);
    }
    finalQueueIndex++;
  }
  finishGame();
}
function buyProduct(productId){
  if(gameOver)return;
  const team=teams[currentTeam];
  const product=products.find(item=>item.id===productId);
  if(!product||team.coins<product.cost||team.slots+product.slots>9||(product.limited&&!braceletAvailable))return;
  team.coins-=product.cost;team.slots+=product.slots;team.itemPoints+=product.points;team.items.push(product);
  if(product.limited)braceletAvailable=false;
  addLog(`🛍️ ${team.name} chọn ${product.name} — còn ${team.coins} xu.`);
  nextTurn();
}
function nextTurn(){
  if(!finalRound){
    currentTeam=(currentTeam+1)%teams.length;
    if(currentTeam===0)round++;
  }else finalQueueIndex++;
  moveToNextPlayableTeam();render();
}
function passTurn(){
  if(gameOver)return;
  addLog(`${teams[currentTeam].name} quyết định ngắm thêm các gian hàng.`);
  nextTurn();
}
function announceAchievement(id){
  if(announced[id]||gameOver)return;
  announced[id]=true;
  const achievement=achievements.find(item=>item.id===id);
  addLog(`📣 MC công bố thành tựu ${achievement.name} (+${achievement.points} điểm).`);
  if(id==='fast'&&firstFinisher!==null){
    teams[firstFinisher].achievementPoints+=2;
    addLog(`⚡ ${teams[firstFinisher].name} là đội hoàn thành đầu tiên và nhận 2 điểm!`);
  }
  render();
}
function finishGame(){
  if(gameOver)return;
  gameOver=true;
  teams.forEach(team=>{
    if(announced.pig&&team.coins>=2)team.achievementPoints+=3;
    if(announced.diamond&&team.slots===9)team.achievementPoints+=2;
    team.status='done';
  });
  render();
  const ranking=teams.map((team,index)=>({...team,index,total:team.itemPoints+team.coins+team.achievementPoints}))
    .sort((a,b)=>b.total-a.total||b.itemPoints-a.itemPoints||b.coins-a.coins);
  const winner=ranking[0];
  $('winnerBox').innerHTML=`<div class="winner-box"><strong>🏆 ${escapeHTML(winner.name)}</strong><span>Vô địch với ${winner.total} điểm · Một chiến thắng thật khéo léo!</span></div>`;
  $('scoreRows').innerHTML=ranking.map((team,index)=>`<tr><td>${index+1}</td><td><b>${escapeHTML(team.name)}</b></td><td>${team.itemPoints}</td><td>${team.coins}</td><td>${team.achievementPoints}</td><td class="score-total">${team.total}</td></tr>`).join('');
  $('results').classList.remove('hidden');
  $('turnKicker').textContent='PHIÊN CHỢ ĐÃ KHÉP LẠI';
  $('turnTitle').textContent='Cảm ơn các đội đã tham gia!';
  $('turnSub').textContent='Cùng xem kết quả cuối cùng nhé.';
  addLog(`🏆 Phiên chợ khép lại. Xin chúc mừng ${winner.name}!`);
  $('results').scrollIntoView({behavior:'smooth',block:'start'});
}
function renderProducts(){
  const team=teams[currentTeam];
  $('products').innerHTML=products.map(product=>{
    const available=!gameOver&&team&&team.status!=='done'&&team.coins>=product.cost&&team.slots+product.slots<=9&&(!product.limited||braceletAvailable);
    let reason='Chưa thể mua';
    if(product.limited&&!braceletAvailable)reason='Đã có người mua';
    else if(team&&team.coins<product.cost)reason='Chưa đủ xu';
    else if(team&&team.slots+product.slots>9)reason='Túi không đủ chỗ';
    return `<article class="product ${available?'':'unavailable'}">
      <div class="product-top"><span class="product-emoji">${product.emoji}</span><div class="product-price">${product.price}${product.oldPrice?`<small>${product.oldPrice}</small>`:''}</div></div>
      <h3>${product.name}</h3><p>${product.description}</p>
      <div class="product-tags"><span class="tag">🎒 ${product.slots} ô</span><span class="tag">⭐ ${product.points} điểm</span>${product.limited?`<span class="tag">${braceletAvailable?'1 suất':'Hết hàng'}</span>`:''}</div>
      <button class="buy-btn" data-buy="${product.id}" ${available?'':'disabled'}>${available?'Chọn món này':reason}</button>
    </article>`;
  }).join('');
  document.querySelectorAll('[data-buy]').forEach(button=>button.addEventListener('click',()=>buyProduct(button.dataset.buy)));
}
function renderTeams(){
  $('teamBoard').innerHTML=teams.map((team,index)=>{
    const active=!gameOver&&index===currentTeam&&team.status!=='done';
    const state=active?'ĐANG CHỌN':team.status==='done'?'ĐÃ DỪNG':'ĐANG CHỜ';
    return `<div class="team-card"><div class="team-head"><b>${active?'❄ ':''}${escapeHTML(team.name)}</b><span class="team-state ${active?'active':team.status==='done'?'done':''}">${state}</span></div>
      <div class="meter-row"><div class="meter"><div class="meter-label"><span>🪙 Xu còn</span><b>${team.coins}/7</b></div><div class="meter-line"><div class="meter-fill" style="width:${team.coins/7*100}%"></div></div></div>
      <div class="meter"><div class="meter-label"><span>🎒 Sức chứa</span><b>${team.slots}/9</b></div><div class="meter-line"><div class="meter-fill" style="width:${team.slots/9*100}%"></div></div></div></div>
      <div class="slots">${Array.from({length:9},(_,slot)=>`<span class="slot ${slot<team.slots?'filled':''}"></span>`).join('')}</div>
      <div class="items-list">${team.items.length?team.items.map(item=>`${item.emoji} ${item.name}`).join(' · '):'Chiếc túi vẫn còn trống'}</div>
      <div class="team-points">Điểm hàng <b>${team.itemPoints}</b> · Thành tựu <b>${team.achievementPoints}</b></div></div>`;
  }).join('');
}
function renderAchievements(){
  $('achievements').innerHTML=achievements.map(achievement=>`<div class="achievement-row"><div><b>${achievement.emoji} ${achievement.name} <span style="color:var(--red)">+${achievement.points}</span></b><small>${achievement.description}</small></div><button class="achievement-btn ${announced[achievement.id]?'on':''}" data-achievement="${achievement.id}" ${announced[achievement.id]?'disabled':''}>${announced[achievement.id]?'ĐÃ MỞ':'Công bố'}</button></div>`).join('');
  document.querySelectorAll('[data-achievement]').forEach(button=>button.addEventListener('click',()=>announceAchievement(button.dataset.achievement)));
}
function render(){
  if(!teams.length)return;
  const team=teams[currentTeam];
  if(!gameOver&&team){
    $('turnTitle').textContent=team.name;
    $('turnSub').textContent=finalRound?'Đây là lượt mua cuối cùng của đội.':'Bạn muốn mang món gì về nhỉ?';
    $('turnKicker').textContent=finalRound?'LƯỢT CUỐI CÙNG':'ĐANG ĐẾN LƯỢT';
    $('roundNum').textContent=String(round).padStart(2,'0');
    $('teamNum').textContent=`${currentTeam+1} / ${teams.length}`;
    $('phaseLabel').textContent=finalRound?'Vòng cuối':'Đang mở';
  }else{
    $('roundNum').textContent='—';$('teamNum').textContent='—';$('phaseLabel').textContent='Đã đóng';
  }
  renderProducts();renderTeams();renderAchievements();
  $('passBtn').disabled=gameOver;$('finishBtn').disabled=gameOver;
}
function showModal(title,message,confirmAction=null){
  $('modalTitle').textContent=title;$('modalText').textContent=message;$('modal').classList.remove('hidden');
  $('modalOk').onclick=()=>{$('modal').classList.add('hidden');if(confirmAction)confirmAction();};
}
$('startBtn').addEventListener('click',startGame);
$('passBtn').addEventListener('click',passTurn);
$('finishBtn').addEventListener('click',()=>{
  if(!gameOver)showModal('Dừng mua sắm?',`${teams[currentTeam].name} sẽ kết thúc việc mua hàng. Các đội còn lại được thêm một lượt cuối.`,()=>markFinished(currentTeam,false));
});
$('rulesBtn').addEventListener('click',()=>showModal('Luật chơi nhanh','Mỗi đội có 7 xu và túi tối đa 9 ô. Mỗi lượt mua tối đa một món. Khi một đội không thể mua thêm hoặc chủ động dừng, các đội còn lại được thêm đúng một lượt cuối. Tổng điểm = điểm hàng + xu dư + điểm thành tựu đã công bố. Vòng tay chỉ có một suất.'));
$('resetBtn').addEventListener('click',()=>showModal('Bắt đầu lại từ đầu?','Trang sẽ trở về phần chuẩn bị để bạn thiết lập các đội chơi mới.',()=>location.reload()));
$('newGameBtn').addEventListener('click',()=>location.reload());
$('printBtn').addEventListener('click',()=>window.print());
