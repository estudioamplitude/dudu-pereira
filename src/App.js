import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom';
import { db, auth } from './firebase';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';

// ── Estilos globais ──────────────────────────────────────────────────────────
const G = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&display=swap');
:root {
  --bg:#080A0F;--surface:#0F1218;--surface2:#161B25;--surface3:#1C2233;
  --border:#1E2538;--border2:#28304A;--primary:#1DBA88;--primary-dim:#1DBA8818;
  --primary-dark:#0F6E56;--blue:#4D9EF5;--amber:#F0A040;--red:#F05050;
  --purple:#7B68EE;--pink:#E870A0;--gold:#D4A843;
  --text:#E8EBF5;--text2:#7A85A8;--text3:#3E4A68;
  --radius:10px;--radius-sm:7px;--radius-lg:16px;--radius-xl:20px;
}
*{box-sizing:border-box;margin:0;padding:0;}
html{scroll-behavior:smooth;}
body{font-family:'Sora',-apple-system,sans-serif;background:var(--bg);color:var(--text);min-height:100vh;}
.topbar{background:rgba(8,10,15,0.95);backdrop-filter:blur(20px);border-bottom:1px solid var(--border);padding:0 2rem;display:flex;align-items:center;justify-content:space-between;height:56px;position:sticky;top:0;z-index:50;}
.logo{display:flex;align-items:center;gap:12px;}
.logo-icon{width:34px;height:34px;border-radius:9px;overflow:hidden;display:flex;align-items:center;justify-content:center;}.logo-icon img{width:100%;height:100%;object-fit:cover;}
.logo-name{font-size:15px;font-weight:700;letter-spacing:-.02em;}
.logo-sub{font-size:10px;color:var(--text3);margin-top:1px;letter-spacing:.04em;text-transform:uppercase;}
.nav{display:flex;gap:2px;}
.nav-btn{padding:7px 16px;border-radius:var(--radius-sm);font-size:12px;cursor:pointer;border:none;background:transparent;color:var(--text2);font-family:inherit;font-weight:600;display:flex;align-items:center;gap:6px;transition:all .2s;}
.nav-btn:hover{background:var(--surface2);color:var(--text);}
.nav-btn.on{background:var(--surface2);color:var(--text);border:1px solid var(--border2);}
.main{max-width:1120px;margin:0 auto;padding:1.75rem 2rem;}
.card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-lg);padding:1.25rem;}
.card-glow{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-lg);padding:1.25rem;position:relative;overflow:hidden;}
.card-glow::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,var(--primary),transparent);opacity:.4;}
.label{font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.1em;margin-bottom:10px;}
.badge{display:inline-flex;align-items:center;font-size:10px;padding:3px 9px;border-radius:20px;font-weight:700;letter-spacing:.02em;}
.b-green{background:#1DBA8820;color:#1DBA88;border:1px solid #1DBA8830;}
.b-amber{background:#F0A04018;color:#F0A040;border:1px solid #F0A04030;}
.b-red{background:#F0505018;color:#F05050;border:1px solid #F0505030;}
.b-blue{background:#4D9EF518;color:#4D9EF5;border:1px solid #4D9EF530;}
.b-gray{background:#3E4A6818;color:var(--text2);border:1px solid var(--border);}
.b-gold{background:#D4A84318;color:#D4A843;border:1px solid #D4A84330;}
.b-inactive{background:#1E253818;color:var(--text3);border:1px solid var(--border);}
.btn{border:1px solid var(--border2);background:transparent;padding:7px 15px;border-radius:var(--radius-sm);font-size:12px;cursor:pointer;color:var(--text);font-family:inherit;font-weight:600;display:inline-flex;align-items:center;gap:5px;transition:all .15s;}
.btn:hover{background:var(--surface2);}
.btn-primary{background:linear-gradient(135deg,#1DBA88,#0F8860);border-color:transparent;color:#fff;box-shadow:0 2px 12px #1DBA8830;}
.btn-primary:hover{box-shadow:0 4px 20px #1DBA8850;filter:brightness(1.08);}
.btn-danger{background:#F0505015;border-color:#F0505035;color:#F05050;}
.btn-sm{padding:4px 11px;font-size:11px;}
.btn-xs{padding:2px 8px;font-size:10px;}
.inp{border:1px solid var(--border);border-radius:var(--radius-sm);padding:8px 11px;font-size:13px;background:var(--surface2);color:var(--text);width:100%;font-family:inherit;transition:all .15s;}
.inp:focus{outline:none;border-color:var(--primary);box-shadow:0 0 0 3px #1DBA8815;}
.sel{border:1px solid var(--border);border-radius:var(--radius-sm);padding:8px 11px;font-size:12px;background:var(--surface2);color:var(--text);font-family:inherit;cursor:pointer;}
.sel:focus{outline:none;border-color:var(--primary);}
.g2{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
.g3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;}
.g4{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;}
.metric{background:var(--surface2);border:1px solid var(--border);border-radius:var(--radius);padding:16px;}
.metric-label{font-size:10px;color:var(--text2);margin-bottom:7px;font-weight:600;letter-spacing:.05em;text-transform:uppercase;}
.metric-val{font-size:28px;font-weight:700;letter-spacing:-.03em;}
.pills{display:flex;gap:5px;}
.pill{padding:5px 13px;border-radius:30px;font-size:11px;font-weight:600;cursor:pointer;border:1px solid var(--border);background:transparent;color:var(--text2);font-family:inherit;transition:all .15s;}
.pill:hover{border-color:var(--border2);color:var(--text);}
.pill.on{background:var(--surface3);border-color:var(--border2);color:var(--text);}
.arow{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:12px 16px;display:flex;align-items:center;gap:12px;cursor:pointer;margin-bottom:6px;transition:all .18s;}
.arow:hover{border-color:var(--border2);background:var(--surface2);transform:translateX(2px);}
.arow.inactive{opacity:.5;}
.av{border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;flex-shrink:0;}
.pb{height:4px;background:var(--border);border-radius:2px;overflow:hidden;}
.pf{height:100%;border-radius:2px;}
.trow{display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid var(--border);}
.trow:last-child{border-bottom:none;}
.ck{width:16px;height:16px;border-radius:4px;border:1px solid var(--border2);cursor:pointer;flex-shrink:0;display:flex;align-items:center;justify-content:center;background:transparent;font-size:9px;transition:all .15s;}
.ck.ok{background:var(--primary);border-color:var(--primary);color:#fff;box-shadow:0 0 8px #1DBA8840;}
.vcard{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-lg);overflow:hidden;margin-bottom:8px;transition:border-color .15s;}
.vcard:hover{border-color:var(--border2);}
.vt{display:flex;align-items:center;gap:12px;padding:12px;cursor:pointer;transition:background .12s;}
.vt:hover{background:var(--surface2);}
.vimg{width:70px;height:42px;border-radius:7px;overflow:hidden;background:var(--surface3);flex-shrink:0;}
.vimg img{width:100%;height:100%;object-fit:cover;}
.vact{display:flex;align-items:center;gap:7px;padding:8px 12px;border-top:1px solid var(--border);background:var(--surface2);}
.mural-card{background:linear-gradient(135deg,#0F1218,#161B25);border:1px solid var(--border);border-radius:var(--radius-lg);padding:1.25rem;margin-bottom:10px;position:relative;overflow:hidden;}
.mural-card::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,#D4A843,transparent);opacity:.5;}
.mural-icon{width:32px;height:32px;border-radius:8px;background:linear-gradient(135deg,#D4A84330,#D4A84315);border:1px solid #D4A84340;display:flex;align-items:center;justify-content:center;font-size:16px;}
.mural-item{background:var(--surface2);border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;margin-bottom:8px;transition:border-color .15s;}
.mural-item:hover{border-color:var(--border2);}
.mural-thumbimg{width:80px;height:46px;border-radius:6px;overflow:hidden;background:var(--surface3);flex-shrink:0;}
.mural-thumbimg img{width:100%;height:100%;object-fit:cover;}
.bitem{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:11px 14px;display:flex;align-items:center;gap:12px;margin-bottom:6px;transition:border-color .15s;}
.bitem:hover{border-color:var(--border2);}
.bimg{width:68px;height:40px;border-radius:6px;overflow:hidden;flex-shrink:0;}
.bimg img{width:100%;height:100%;object-fit:cover;}
.prow{display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-bottom:1px solid var(--border);}
.prow:last-child{border-bottom:none;}
.banner{border-radius:var(--radius-sm);padding:8px 12px;font-size:12px;display:flex;align-items:center;gap:7px;margin-bottom:12px;font-weight:500;}
.ta{width:100%;border:1px solid var(--border);border-radius:var(--radius-sm);padding:8px 10px;font-size:12px;font-family:inherit;color:var(--text);background:var(--surface2);resize:vertical;min-height:54px;}
.ta:focus{outline:none;border-color:var(--primary);box-shadow:0 0 0 3px #1DBA8815;}
.pizza-wrap{display:grid;grid-template-columns:140px 1fr;gap:16px;align-items:center;}
.leg-row{display:flex;align-items:center;gap:7px;font-size:11px;color:var(--text2);margin-bottom:5px;}
.moverlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.75);backdrop-filter:blur(8px);z-index:200;align-items:flex-start;justify-content:center;padding-top:52px;}
.moverlay.on{display:flex;}
.mbox{background:var(--surface);border:1px solid var(--border2);border-radius:var(--radius-xl);padding:1.5rem;width:460px;max-width:95vw;max-height:86vh;overflow-y:auto;box-shadow:0 24px 80px rgba(0,0,0,.6);}
.mhdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:1.25rem;}
.crow{display:flex;align-items:center;gap:10px;padding:8px 4px;border-bottom:1px solid var(--border);cursor:pointer;font-size:12px;transition:background .12s;border-radius:4px;}
.crow:hover{background:var(--surface2);}
.crow:last-child{border-bottom:none;}
.back-btn{display:inline-flex;align-items:center;gap:6px;font-size:13px;color:var(--text2);cursor:pointer;border:none;background:none;font-family:inherit;margin-bottom:1.25rem;padding:6px 0;transition:color .15s;}
.back-btn:hover{color:var(--text);}
.flabel{font-size:11px;color:var(--text2);margin-bottom:5px;font-weight:600;}
.fsec{background:var(--surface2);border:1px solid var(--border);border-radius:var(--radius);padding:14px;margin-bottom:12px;}
.empty{text-align:center;padding:3rem;color:var(--text3);font-size:13px;}
.sdiv{display:flex;align-items:center;gap:12px;margin:1.5rem 0 1rem;}
.sdiv-line{flex:1;height:1px;background:var(--border);}
.sdiv-label{font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;white-space:nowrap;}
.loading{display:flex;align-items:center;justify-content:center;min-height:100vh;font-size:14px;color:var(--text2);}
`;

// ── Constantes ───────────────────────────────────────────────────────────────
const MS = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
const PW = {Alta:3,Média:2,Baixa:1};
const CL = ['#1DBA88','#4D9EF5','#F0A040','#7B68EE','#E870A0','#F05050'];
const AVC = ['#1DBA88','#4D9EF5','#F0A040','#7B68EE','#E870A0','#F05050'];

// ── Helpers ──────────────────────────────────────────────────────────────────
function mN(){const d=new Date();return MS[d.getMonth()]+'/'+d.getFullYear();}
function sP(p,dia){
  if(p.status==='pago')return 'pago';
  const mi=MS.indexOf(p.mes.split('/')[0]),an=parseInt(p.mes.split('/')[1]);
  const v=new Date(an,mi,dia),h=new Date();h.setHours(0,0,0,0);
  return h>v?'atrasado':'pendente';
}
function gP(){
  const n=new Date(),r=[];
  for(let i=2;i>=0;i--){const d=new Date(n.getFullYear(),n.getMonth()-i,1);r.push({mes:MS[d.getMonth()]+'/'+d.getFullYear(),status:i===0?'pendente':'pago'});}
  return r;
}
function ini(nm){const p=nm.trim().split(' ').filter(Boolean);return p.length===1?p[0].slice(0,2).toUpperCase():(p[0][0]+p[p.length-1][0]).toUpperCase();}
function cT(tf,td){
  const at=(tf||[]).filter(t=>!t.feita);if(!at.length)return[];
  const tot=at.reduce((s,t)=>s+PW[t.prio],0);
  return at.map(t=>({...t,mins:Math.round((PW[t.prio]/tot)*td)}));
}
function yTh(id){return 'https://img.youtube.com/vi/'+id+'/mqdefault.jpg';}
function yEm(id){return 'https://www.youtube.com/embed/'+id+'?rel=0&autoplay=1';}
function yId(url){const m=url.match(/(?:v=|youtu\.be\/)([^&\s]+)/);return m?m[1]:null;}
function pgr(a){return Math.round(((a.t?.R?.p||0)+(a.t?.T?.p||0)+(a.t?.K?.p||0))/3);}

// ── Avatar + Badge ───────────────────────────────────────────────────────────
function Av({a,z=36}){
  return <div className="av" style={{width:z,height:z,background:a.ac+'22',border:`2px solid ${a.ac}50`,color:a.ac,fontSize:Math.round(z*.34),boxShadow:`0 0 12px ${a.ac}20`}}>{a.in}</div>;
}
function Bd({l}){
  const m={pago:'b-green',pendente:'b-amber',atrasado:'b-red',Alta:'b-green',Média:'b-amber',Baixa:'b-gray',
    Técnica:'b-amber',Teoria:'b-blue',Repertório:'b-green',Estudado:'b-green',Ativo:'b-green',Inativo:'b-inactive'};
  return <span className={`badge ${m[l]||'b-gray'}`}>{l}</span>;
}

// ── Pizza SVG ─────────────────────────────────────────────────────────────────
function Pizza({dist,td}){
  if(!dist.length)return <div style={{fontSize:12,color:'var(--text3)',padding:'1rem 0'}}>Nenhuma estudo ativa.</div>;
  const all=dist.map((t,i)=>({v:t.mins,c:CL[i%CL.length],l:t.tx}));
  const livre=td-dist.reduce((s,t)=>s+t.mins,0);
  if(livre>0)all.push({v:livre,c:'#1E2538',l:'Tempo livre'});
  const sum=all.reduce((s,x)=>s+x.v,0);
  let ang=-Math.PI/2,paths=[];
  all.forEach((x,i)=>{
    const a=(x.v/sum)*2*Math.PI;if(a<0.001)return;
    const x1=65+60*Math.cos(ang),y1=65+60*Math.sin(ang);
    const x2=65+60*Math.cos(ang+a),y2=65+60*Math.sin(ang+a);
    paths.push(<path key={i} d={`M65,65 L${x1.toFixed(1)},${y1.toFixed(1)} A60,60 0 ${a>Math.PI?1:0},1 ${x2.toFixed(1)},${y2.toFixed(1)} Z`} fill={x.c} stroke="#080A0F" strokeWidth="2"/>);
    ang+=a;
  });
  const tot=dist.reduce((s,t)=>s+t.mins,0);
  return <div className="pizza-wrap">
    <svg viewBox="0 0 130 130" style={{width:130,height:130,filter:'drop-shadow(0 0 12px #1DBA8820)'}}>{paths}</svg>
    <div>
      {all.map((x,i)=><div key={i} className="leg-row">
        <div style={{width:8,height:8,borderRadius:'50%',background:x.c,flexShrink:0,boxShadow:`0 0 6px ${x.c}60`}}/>
        <span style={{flex:1}}>{x.l.length>24?x.l.slice(0,24)+'…':x.l}</span>
        <span style={{fontWeight:700,color:'var(--text)'}}>{x.v}min</span>
      </div>)}
      <div style={{borderTop:'1px solid var(--border)',paddingTop:7,marginTop:5,display:'flex',justifyContent:'space-between',fontSize:11}}>
        <span style={{color:'var(--text3)'}}>Total</span>
        <span style={{fontWeight:700,color:'var(--text)'}}>{tot} / {td} min</span>
      </div>
    </div>
  </div>;
}

// ── Modal ─────────────────────────────────────────────────────────────────────
function Modal({title,onClose,children}){
  return <div className="moverlay on" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
    <div className="mbox">
      <div className="mhdr">
        <div style={{fontSize:15,fontWeight:700}}>{title}</div>
        <button className="btn btn-xs" onClick={onClose}>✕</button>
      </div>
      {children}
    </div>
  </div>;
}

// ── LOGIN ─────────────────────────────────────────────────────────────────────
function Login({onLogin}){
  const [email,setEmail]=useState('');
  const [senha,setSenha]=useState('');
  const [err,setErr]=useState('');
  const [loading,setLoading]=useState(false);

  async function handleLogin(e){
    e.preventDefault();setErr('');setLoading(true);
    try{await signInWithEmailAndPassword(auth,email,senha);onLogin();}
    catch{setErr('Email ou senha incorretos.');}
    setLoading(false);
  }

  return <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh',background:'var(--bg)'}}>
    <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',padding:'2.5rem',width:380,boxShadow:'0 24px 80px rgba(0,0,0,.5)'}}>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:'2rem'}}>
        <div className="logo-icon"><img src="https://dudu-pereira.vercel.app/favicon.ico.png" alt="Dudu Pereira logo"/></div>
        <div>
          <div style={{fontSize:17,fontWeight:700}}>Dudu Pereira</div>
          <div style={{fontSize:11,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.04em'}}>Área do Professor</div>
        </div>
      </div>
      <form onSubmit={handleLogin}>
        <div style={{marginBottom:12}}>
          <div className="flabel">Email</div>
          <input className="inp" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="seu@email.com" required/>
        </div>
        <div style={{marginBottom:16}}>
          <div className="flabel">Senha</div>
          <input className="inp" type="password" value={senha} onChange={e=>setSenha(e.target.value)} placeholder="••••••••" required/>
        </div>
        {err&&<div style={{fontSize:12,color:'var(--red)',marginBottom:12}}>{err}</div>}
        <button className="btn btn-primary" style={{width:'100%',justifyContent:'center',padding:'10px'}} type="submit" disabled={loading}>
          {loading?'Entrando…':'Entrar'}
        </button>
      </form>
    </div>
  </div>;
}

// ── PAINEL DO PROFESSOR ───────────────────────────────────────────────────────

// ── Painel de Avisos ──────────────────────────────────────────────────────────
function PainelAvisos(){
  const [texto,setTexto]=React.useState('');
  const [avisos,setAvisos]=React.useState([]);
  const [salvando,setSalvando]=React.useState(false);

  React.useEffect(()=>{
    const unsub=onSnapshot(collection(db,'avisos'),snap=>{
      const lista=snap.docs.map(d=>({id:d.id,...d.data()}));
      lista.sort((a,b)=>(b.criadoEm||0)-(a.criadoEm||0));
      setAvisos(lista);
    });
    return ()=>unsub();
  },[]);

  async function publicar(){
    if(!texto.trim())return;
    setSalvando(true);
    await setDoc(doc(db,'avisos',Date.now().toString()),{
      texto:texto.trim(),
      criadoEm:Date.now(),
      lido:false,
    });
    setTexto('');
    setSalvando(false);
  }

  async function excluirAviso(id){
    if(!window.confirm('Excluir este aviso?'))return;
    await deleteDoc(doc(db,'avisos',id));
  }

  function formatData(ts){
    if(!ts)return '';
    const d=new Date(ts);
    return d.toLocaleDateString('pt-BR',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});
  }

  return <div>
    <div style={{fontSize:20,fontWeight:700,letterSpacing:'-.02em',marginBottom:4}}>📢 Avisos</div>
    <div style={{fontSize:12,color:'var(--text2)',marginBottom:'1.2rem'}}>Publique um aviso e ele aparecerá como pop-up para todos os alunos</div>

    <div className="card" style={{marginBottom:'1.2rem'}}>
      <div className="label">Novo aviso</div>
      <textarea
        className="ta"
        style={{minHeight:100,marginBottom:10,fontSize:13}}
        placeholder="Escreva o aviso para seus alunos... Ex: Aula cancelada na sexta-feira dia 20/06."
        value={texto}
        onChange={e=>setTexto(e.target.value)}
      />
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <span style={{fontSize:11,color:'var(--text3)'}}>{texto.length} caracteres</span>
        <button className="btn btn-primary btn-sm" onClick={publicar} disabled={salvando||!texto.trim()}>
          {salvando?'Publicando…':'📢 Publicar aviso'}
        </button>
      </div>
    </div>

    <div className="label">Avisos publicados ({avisos.length})</div>
    {avisos.length===0&&<div className="empty">Nenhum aviso publicado ainda.</div>}
    {avisos.map(a=><div key={a.id} style={{
      background:'var(--surface)',border:'1px solid var(--border)',
      borderRadius:'var(--radius)',padding:'12px 16px',marginBottom:8,
      display:'flex',alignItems:'flex-start',gap:12,
    }}>
      <div style={{fontSize:20,flexShrink:0}}>📢</div>
      <div style={{flex:1}}>
        <div style={{fontSize:13,color:'var(--text)',lineHeight:1.5,marginBottom:5}}>{a.texto}</div>
        <div style={{fontSize:10,color:'var(--text3)'}}>{formatData(a.criadoEm)}</div>
      </div>
      <button className="btn btn-xs btn-danger" onClick={()=>excluirAviso(a.id)}>× Excluir</button>
    </div>)}
  </div>;
}

// ── Splash Screen ─────────────────────────────────────────────────────────────
function SplashScreen(){
  return <div style={{
    position:'fixed',inset:0,background:'#080A0F',
    display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
    zIndex:9999,fontFamily:'Sora,sans-serif',
  }}>
    <style>{`
      @keyframes dp-logo-in{0%{opacity:0;transform:scale(.7);}60%{transform:scale(1.05);}100%{opacity:1;transform:scale(1);}}
      @keyframes dp-pulse{0%,100%{transform:scale(1);}50%{transform:scale(1.09);}}
      @keyframes dp-glow{0%,100%{box-shadow:0 0 30px #1DBA8830;}50%{box-shadow:0 0 55px #1DBA8860;}}
      @keyframes dp-name-in{0%{opacity:0;letter-spacing:.3em;}100%{opacity:1;letter-spacing:-.02em;}}
      @keyframes dp-sub-in{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
      @keyframes dp-bar{0%{width:0%;}100%{width:100%;}}
    `}</style>
    <div style={{width:160,height:160,borderRadius:32,overflow:'hidden',marginBottom:28,animation:'dp-logo-in .7s cubic-bezier(.34,1.56,.64,1) both, dp-pulse 2s 1s ease-in-out infinite, dp-glow 2s 1s ease-in-out infinite'}}>
      <img src="https://dudu-pereira.vercel.app/favicon.ico.png" alt="Dudu Pereira" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
    </div>
    <div style={{fontSize:24,fontWeight:700,color:'#E8EBF5',marginBottom:6,animation:'dp-name-in .8s .5s cubic-bezier(.16,1,.3,1) both'}}>Dudu Pereira</div>
    <div style={{fontSize:11,color:'#3E4A68',letterSpacing:'.1em',textTransform:'uppercase',marginBottom:38,animation:'dp-sub-in .6s .9s ease both',opacity:0,animationFillMode:'forwards'}}>Escola de Acordeón</div>
    <div style={{width:150,height:3,background:'#1E2538',borderRadius:2,overflow:'hidden',animation:'dp-sub-in .4s 1.1s ease both',opacity:0,animationFillMode:'forwards'}}>
      <div style={{height:'100%',background:'linear-gradient(90deg,#1DBA88,#4D9EF5)',borderRadius:2,animation:'dp-bar 1.6s 1.2s ease forwards',width:0}}/>
    </div>
  </div>;
}

function Professor(){
  const [alunos,setAlunos]=useState([]);
  const [banco,setBanco]=useState([]);
  const [aba,setAba]=useState('alunos');
  const [alunoAberto,setAlunoAberto]=useState(null);
  const [loading,setLoading]=useState(true);
  const [filtro,setFiltro]=useState('ativos');
  const [filtroDia,setFiltroDia]=useState('');
  const [busca,setBusca]=useState('');
  const [modal,setModal]=useState(null);

  useEffect(()=>{
    const unsub=onSnapshot(collection(db,'alunos'),snap=>{
      setAlunos(snap.docs.map(d=>({id:d.id,...d.data()})));
      setLoading(false);
    });
    const unsubB=onSnapshot(collection(db,'banco'),snap=>{
      setBanco(snap.docs.map(d=>({id:d.id,...d.data()})));
    });
    return ()=>{unsub();unsubB();};
  },[]);

  async function salvarAluno(dados,editId){
    if(editId){
      // Edição: atualiza só os campos do formulário, preserva o resto
      await updateDoc(doc(db,'alunos',editId),{
        nm:dados.nm,
        in:ini(dados.nm),
        pl:dados.pl,
        dia:parseInt(dados.dia)||10,
        val:parseFloat(dados.val)||150,
        td:parseInt(dados.td)||30,
        wa:dados.wa||'',
        wr:dados.wr||'',
        an:dados.an||'',
        diasAula:dados.diasAula||[],
        horario:dados.horario||'',
      });
    } else {
      // Novo aluno: cria documento completo
      const id=Date.now().toString();
      await setDoc(doc(db,'alunos',id),{
        nm:dados.nm,in:ini(dados.nm),
        ac:AVC[alunos.length%AVC.length],
        pl:dados.pl,dia:parseInt(dados.dia)||10,val:parseFloat(dados.val)||150,
        td:parseInt(dados.td)||30,wa:dados.wa||'',wr:dados.wr||'',an:dados.an||'',
        diasAula:dados.diasAula||[],horario:dados.horario||'',
        ativo:true,pags:gP(),tf:[],ve:[],es:[],ob:'',mural:[],
        t:{R:{p:0,at:'—',ml:'—'},T:{p:0,at:'—',ml:'—'},K:{p:0,at:'—',bpm:60,ml:'—'}},
      });
    }
    setModal(null);
  }

  async function atualizarAluno(id,dados){
    await updateDoc(doc(db,'alunos',id),dados);
    if(alunoAberto?.id===id)setAlunoAberto(a=>({...a,...dados}));
  }

  async function salvarVideo(dados,editId){
    const id=editId||Date.now().toString();
    await setDoc(doc(db,'banco',id),dados);
    setModal(null);
  }

  async function excluirAluno(id){
    if(!window.confirm('Excluir este aluno permanentemente? Esta ação não pode ser desfeita.'))return;
    await deleteDoc(doc(db,'alunos',id));
    setAlunoAberto(null);
  }

  async function excluirVideo(id){
    if(!window.confirm('Remover este vídeo?'))return;
    await deleteDoc(doc(db,'banco',id));
    for(const a of alunos){
      if(a.ve?.includes(id)){
        await updateDoc(doc(db,'alunos',a.id),{ve:(a.ve||[]).filter(x=>x!==id),es:(a.es||[]).filter(x=>x!==id)});
      }
    }
  }

  const hoje=new Date();
  const mesHoje=hoje.getMonth();
  const diaHoje=hoje.getDate();
  const aniversariantes=alunos.filter(a=>a.ativo&&a.an).map(a=>{
    const [,mm,dd]=a.an.split('-');
    const mes=parseInt(mm)-1,dia=parseInt(dd);
    if(mes!==mesHoje)return null;
    return {a,dia,diasRestantes:dia-diaHoje};
  }).filter(Boolean).sort((x,y)=>x.dia-y.dia);

  const ativos=alunos.filter(a=>a.ativo).length;
  const inativos=alunos.filter(a=>!a.ativo).length;
  const p2=alunos.filter(a=>a.ativo&&a.pags?.[0]&&sP(a.pags[0],a.dia)==='pago').length;
  const pe=alunos.filter(a=>a.ativo&&a.pags?.[0]&&sP(a.pags[0],a.dia)==='pendente').length;
  const at=alunos.filter(a=>a.ativo&&a.pags?.[0]&&sP(a.pags[0],a.dia)==='atrasado').length;

  let fl=alunos.filter(a=>a.nm?.toLowerCase().includes(busca.toLowerCase()));
  if(filtro==='ativos')fl=fl.filter(a=>a.ativo);
  else if(filtro==='inativos')fl=fl.filter(a=>!a.ativo);
  if(filtroDia)fl=fl.filter(a=>(a.diasAula||[]).includes(filtroDia));

  if(loading)return <SplashScreen/>;

  if(alunoAberto){
    const a=alunos.find(x=>x.id===alunoAberto.id)||alunoAberto;
    return <PerfilAluno a={a} banco={banco} isDemo={false}
      onVoltar={()=>setAlunoAberto(null)}
      onUpdate={dados=>atualizarAluno(a.id,dados)}
      onEditar={()=>setModal({tipo:'aluno',aluno:a})}
      onModalMural={()=>setModal({tipo:'mural',aluno:a})}
      onEnviarVideo={()=>setModal({tipo:'enviarVideo',aluno:a})}
      onExcluir={()=>excluirAluno(a.id)}
      salvarAluno={salvarAluno}
      modal={modal} setModal={setModal} banco={banco} alunos={alunos}
    />;
  }

  return <div>
    <style>{G}</style>
    <div className="topbar">
      <div className="logo">
        <div className="logo-icon"><img src="https://dudu-pereira.vercel.app/favicon.ico.png" alt="Dudu Pereira logo"/></div>
        <div><div className="logo-name">Dudu Pereira</div><div className="logo-sub">Professor</div></div>
      </div>
      <nav className="nav">
        <button className={`nav-btn ${aba==='alunos'?'on':''}`} onClick={()=>setAba('alunos')}>👥 Alunos</button>
        <button className={`nav-btn ${aba==='banco'?'on':''}`} onClick={()=>setAba('banco')}>▶ Vídeos</button>
        <button className={`nav-btn ${aba==='avisos'?'on':''}`} onClick={()=>setAba('avisos')}>📢 Avisos</button>
        <button className="nav-btn" onClick={()=>signOut(auth)}>Sair</button>
      </nav>
    </div>

    {modal&&<ModalDespachante modal={modal} setModal={setModal} alunos={alunos} banco={banco}
      salvarAluno={salvarAluno} salvarVideo={salvarVideo} atualizarAluno={atualizarAluno}/>}

    <div className="main">
      {aba==='alunos'&&<div>
        {aniversariantes.length>0&&<div style={{background:'linear-gradient(135deg,#7B68EE18,#D4A84318)',border:'1px solid #D4A84335',borderRadius:14,padding:'14px 18px',marginBottom:'1.2rem',display:'flex',alignItems:'center',gap:14,flexWrap:'wrap'}}>
          <div style={{fontSize:26,flexShrink:0}}>🎂</div>
          <div style={{flex:1}}>
            <div style={{fontSize:12,fontWeight:700,color:'#D4A843',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:6}}>Aniversários em {MS[mesHoje]}</div>
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
              {aniversariantes.map(({a,dia,diasRestantes})=><div key={a.id} style={{background:'#D4A84312',border:'1px solid #D4A84330',borderRadius:8,padding:'6px 12px',display:'flex',alignItems:'center',gap:8}}>
                <Av a={a} z={28}/>
                <div>
                  <div style={{fontSize:13,fontWeight:700}}>{a.nm.split(' ')[0]}</div>
                  <div style={{fontSize:10,color:'#D4A843',fontWeight:600}}>
                    {diasRestantes<0?`Dia ${dia} — já passou`:diasRestantes===0?`🎉 Hoje! Dia ${dia}`:diasRestantes===1?`Amanhã! Dia ${dia}`:`Dia ${dia} — em ${diasRestantes} dias`}
                  </div>
                </div>
              </div>)}
            </div>
          </div>
        </div>}

        <div className="g4" style={{marginBottom:'1.4rem'}}>
          {[['Total ativos',ativos,'var(--text)'],['Em dia',p2,'var(--primary)'],['Pendentes',pe,'var(--amber)'],['Atrasados',at,'var(--red)']].map(([l,v,c])=>
            <div key={l} className="metric"><div className="metric-label">{l}</div><div className="metric-val" style={{color:c}}>{v}</div></div>
          )}
        </div>

        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12,gap:10,flexWrap:'wrap'}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <span className="label" style={{margin:0}}>Alunos</span>
            <div className="pills">
              {[['ativos',`Ativos (${ativos})`],['inativos',`Inativos (${inativos})`],['todos',`Todos (${alunos.length})`]].map(([f,l])=>
                <button key={f} className={`pill ${filtro===f?'on':''}`} onClick={()=>setFiltro(f)}>{l}</button>
              )}
            </div>
          </div>
          <div style={{display:'flex',gap:7,alignItems:'center'}}>
            <select className="sel" style={{fontSize:11}} value={filtroDia} onChange={e=>setFiltroDia(e.target.value)}>
              <option value="">Todos os dias</option>
              {['Segunda','Terça','Quarta','Quinta','Sexta','Sábado'].map(d=><option key={d}>{d}</option>)}
            </select>
            <input className="inp" style={{width:150,fontSize:12}} placeholder="Buscar aluno..." value={busca} onChange={e=>setBusca(e.target.value)}/>
            <button className="btn btn-primary btn-sm" onClick={()=>setModal({tipo:'aluno',aluno:null})}>+ Novo aluno</button>
          </div>
        </div>

        {fl.map(a=>{
          const p=pgr(a),pb=a.pags?.[0],st=pb?sP(pb,a.dia):'pendente';
          return <div key={a.id} className={`arow ${!a.ativo?'inactive':''}`} style={st==='atrasado'&&a.ativo?{borderColor:'#F0505035'}:{}} onClick={()=>setAlunoAberto(a)}>
            <Av a={a} z={36}/>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:'flex',alignItems:'center',gap:7}}>
                <span style={{fontSize:14,fontWeight:700}}>{a.nm}</span>
                {!a.ativo&&<Bd l="Inativo"/>}
              </div>
              <div style={{fontSize:11,color:'var(--text2)',marginTop:2}}>{a.pl} · R$ {a.val} · {a.td}min/dia{(a.diasAula||[]).length>0?` · ${(a.diasAula||[]).join(', ')}`:''}</div>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:12}}>
              {a.ativo&&<Bd l={st}/>}
              <span style={{color:'var(--text3)',fontSize:16}}>›</span>
            </div>
          </div>;
        })}
        {fl.length===0&&<div className="empty">Nenhum aluno encontrado.</div>}
      </div>}

      {aba==='banco'&&<BancoVideos banco={banco} alunos={alunos} modal={modal} setModal={setModal} salvarVideo={salvarVideo} excluirVideo={excluirVideo} atualizarAluno={atualizarAluno}/>}
      {aba==='avisos'&&<PainelAvisos/>}
    </div>
  </div>;
}

// ── Modal despachante ─────────────────────────────────────────────────────────
function ModalDespachante({modal,setModal,alunos,banco,salvarAluno,salvarVideo,atualizarAluno}){
  if(!modal)return null;
  if(modal.tipo==='aluno')return <ModalAluno aluno={modal.aluno?alunos.find(a=>a.id===modal.aluno.id)||modal.aluno:null} onSalvar={salvarAluno} onClose={()=>setModal(null)}/>;
  if(modal.tipo==='mural')return <ModalMural aluno={modal.aluno} onSalvar={async(dados)=>{
    const a=alunos.find(x=>x.id===modal.aluno.id);
    await atualizarAluno(a.id,{mural:[...(a.mural||[]),dados]});
    setModal(null);
  }} onClose={()=>setModal(null)}/>;
  if(modal.tipo==='enviarVideo')return <ModalEnviarVideo aluno={modal.aluno} banco={banco} onToggle={async(vId)=>{
    const a=alunos.find(x=>x.id===modal.aluno.id);
    const tem=(a.ve||[]).includes(vId);
    await atualizarAluno(a.id,{ve:tem?(a.ve||[]).filter(x=>x!==vId):[...(a.ve||[]),vId]});
  }} onClose={()=>setModal(null)}/>;
  if(modal.tipo==='enviarBanco')return <ModalEnviarBanco video={modal.video} alunos={alunos} onToggle={async(aId)=>{
    const a=alunos.find(x=>x.id===aId);
    const tem=(a.ve||[]).includes(modal.video.id);
    await atualizarAluno(aId,{ve:tem?(a.ve||[]).filter(x=>x!==modal.video.id):[...(a.ve||[]),modal.video.id]});
  }} onClose={()=>setModal(null)}/>;
  if(modal.tipo==='video')return <ModalVideo video={modal.video} onSalvar={salvarVideo} onClose={()=>setModal(null)}/>;
  return null;
}

// ── Modal Aluno ───────────────────────────────────────────────────────────────
function ModalAluno({aluno,onSalvar,onClose}){
  const [form,setForm]=useState({nm:aluno?.nm||'',wa:aluno?.wa||'',wr:aluno?.wr||'',an:aluno?.an||'',pl:aluno?.pl||'Learning Plan',dia:aluno?.dia?.toString()||'10',val:aluno?.val?.toString()||'150',td:aluno?.td?.toString()||'30',diasAula:aluno?.diasAula||[],horario:aluno?.horario||''});
  const f=k=>v=>setForm(p=>({...p,[k]:v}));
  return <Modal title={aluno?'Editar aluno':'Novo aluno'} onClose={onClose}>
    <div className="fsec">
      <div className="label">Dados pessoais</div>
      <div style={{marginBottom:9}}><div className="flabel">Nome completo *</div><input className="inp" value={form.nm} onChange={e=>f('nm')(e.target.value)} placeholder="Ex: João da Silva"/></div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:9,marginBottom:9}}>
        <div><div className="flabel">WhatsApp (DDD)</div><input className="inp" value={form.wa} onChange={e=>f('wa')(e.target.value)} placeholder="49999990000"/></div>
        <div><div className="flabel">Aniversário</div><input className="inp" type="date" value={form.an} onChange={e=>f('an')(e.target.value)}/></div>
      </div>
      <div><div className="flabel">WhatsApp do responsável (se menor)</div><input className="inp" value={form.wr} onChange={e=>f('wr')(e.target.value)} placeholder="49999990000"/></div>
    </div>
    <div className="fsec">
      <div className="label">Plano e pagamento</div>
      <div style={{display:'flex',gap:7,marginBottom:12}}>
        {['Learning Plan','Wellbeing Plan'].map(p=><button key={p} onClick={()=>f('pl')(p)} style={{flex:1,padding:9,borderRadius:'var(--radius-sm)',cursor:'pointer',fontSize:12,fontWeight:700,background:form.pl===p?'var(--primary-dim)':'transparent',border:`1px solid ${form.pl===p?'var(--primary)':'var(--border)'}`,color:form.pl===p?'var(--primary)':'var(--text2)',fontFamily:'inherit'}}>{p}</button>)}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:9}}>
        <div><div className="flabel">Valor (R$)</div><input className="inp" type="number" value={form.val} onChange={e=>f('val')(e.target.value)}/></div>
        <div><div className="flabel">Vencimento (dia)</div><input className="inp" type="number" value={form.dia} onChange={e=>f('dia')(e.target.value)}/></div>
        <div><div className="flabel">Tempo/dia (min)</div><input className="inp" type="number" value={form.td} onChange={e=>f('td')(e.target.value)}/></div>
      </div>
    </div>
    <div className="fsec">
      <div className="label">Dia da aula</div>
      <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
        {['Segunda','Terça','Quarta','Quinta','Sexta','Sábado'].map(d=>{
          const sel=(form.diasAula||[]).includes(d);
          return <button key={d} onClick={()=>setForm(p=>({...p,diasAula:sel?p.diasAula.filter(x=>x!==d):[...(p.diasAula||[]),d]}))} style={{padding:'6px 12px',borderRadius:20,cursor:'pointer',fontSize:11,fontWeight:600,background:sel?'var(--primary-dim)':'transparent',border:`1px solid ${sel?'var(--primary)':'var(--border)'}`,color:sel?'var(--primary)':'var(--text2)',fontFamily:'inherit'}}>{d}</button>;
        })}
      </div>
    </div>
    <div className="fsec" style={{marginBottom:12}}>
      <div className="label">Horário da aula</div>
      <input className="inp" type="time" value={form.horario} onChange={e=>setForm(p=>({...p,horario:e.target.value}))} style={{width:160,fontSize:13}}/>
      <div style={{fontSize:11,color:'var(--text3)',marginTop:5}}>Este horário será exibido na área do aluno</div>
    </div>
    <div style={{display:'flex',gap:9,justifyContent:'flex-end'}}>
      <button className="btn btn-sm" onClick={onClose}>Cancelar</button>
      <button className="btn btn-primary btn-sm" onClick={()=>{if(!form.nm.trim()){alert('Nome obrigatório.');return;}onSalvar(form,aluno?.id);}}>✓ {aluno?'Salvar alterações':'Cadastrar aluno'}</button>
    </div>
  </Modal>;
}

// ── Modal Video ───────────────────────────────────────────────────────────────
function ModalVideo({video,onSalvar,onClose}){
  const [form,setForm]=useState({tt:video?.tt||'',url:video?`https://www.youtube.com/watch?v=${video.yt}`:'',tr:video?.tr||'Técnica',ob:video?.ob||''});
  const [prev,setPrev]=useState(null);
  const f=k=>v=>setForm(p=>({...p,[k]:v}));
  return <Modal title={video?'Editar vídeo':'Novo vídeo'} onClose={onClose}>
    <div style={{marginBottom:10}}><div className="flabel">Título</div><input className="inp" value={form.tt} onChange={e=>f('tt')(e.target.value)} placeholder="Ex: Exercício de fole — nível 1"/></div>
    <div style={{marginBottom:10}}><div className="flabel">Link YouTube (não listado)</div><input className="inp" value={form.url} onChange={e=>f('url')(e.target.value)} placeholder="https://www.youtube.com/watch?v=..."/></div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:9,marginBottom:10}}>
      <div><div className="flabel">Trilha</div><select className="sel" style={{width:'100%'}} value={form.tr} onChange={e=>f('tr')(e.target.value)}><option>Técnica</option><option>Teoria</option><option>Repertório</option></select></div>
      <div><div className="flabel">Observações</div><input className="inp" value={form.ob} onChange={e=>f('ob')(e.target.value)} placeholder="Opcional"/></div>
    </div>
    {prev&&<iframe src={yEm(prev)} style={{width:'100%',height:140,borderRadius:8,border:'none',marginBottom:10}} allowFullScreen/>}
    <div style={{display:'flex',gap:7,justifyContent:'flex-end'}}>
      <button className="btn btn-sm" onClick={()=>setPrev(yId(form.url))}>👁 Preview</button>
      <button className="btn btn-primary btn-sm" onClick={()=>{const yt=yId(form.url);if(!form.tt||!yt){alert('Preencha título e link.');return;}onSalvar({tt:form.tt,tr:form.tr,yt,ob:form.ob},video?.id);}}>✓ Salvar</button>
    </div>
  </Modal>;
}

// ── Modal Mural ───────────────────────────────────────────────────────────────
function ModalMural({aluno,onSalvar,onClose}){
  const hoje=new Date();
  const dataHoje=hoje.toLocaleDateString('pt-BR',{month:'short',year:'numeric'}).replace('.','').replace(/^\w/,m=>m.toUpperCase());
  const [form,setForm]=useState({tt:'',url:'',data:dataHoje});
  const [prev,setPrev]=useState(null);
  const f=k=>v=>setForm(p=>({...p,[k]:v}));
  return <Modal title={`🎬 Adicionar ao mural de ${aluno.nm.split(' ')[0]}`} onClose={onClose}>
    <div style={{marginBottom:10}}><div className="flabel">Título / Música</div><input className="inp" value={form.tt} onChange={e=>f('tt')(e.target.value)} placeholder="Ex: Besame Mucho — execução completa"/></div>
    <div style={{marginBottom:10}}><div className="flabel">Link YouTube</div><input className="inp" value={form.url} onChange={e=>f('url')(e.target.value)} placeholder="https://www.youtube.com/watch?v=..."/></div>
    <div style={{marginBottom:10}}><div className="flabel">Data (opcional)</div><input className="inp" value={form.data} onChange={e=>f('data')(e.target.value)} placeholder="Ex: Jun 2025"/></div>
    {prev&&<iframe src={yEm(prev)} style={{width:'100%',height:130,borderRadius:8,border:'none',marginBottom:10}} allowFullScreen/>}
    <div style={{display:'flex',gap:7,justifyContent:'flex-end'}}>
      <button className="btn btn-sm" onClick={()=>setPrev(yId(form.url))}>👁 Preview</button>
      <button className="btn btn-primary btn-sm" onClick={()=>{const yt=yId(form.url);if(!form.tt||!yt){alert('Preencha título e link.');return;}onSalvar({id:Date.now().toString(),tt:form.tt,yt,data:form.data});}}>✓ Adicionar</button>
    </div>
  </Modal>;
}

// ── Modal Enviar Video ────────────────────────────────────────────────────────
function ModalEnviarVideo({aluno,banco,onToggle,onClose}){
  const [ve,setVe]=useState(aluno.ve||[]);
  return <Modal title={`Enviar vídeo para ${aluno.nm.split(' ')[0]}`} onClose={onClose}>
    <p style={{fontSize:12,color:'var(--text2)',marginBottom:10}}>Selecione vídeos do banco</p>
    {banco.map(v=>{const t=ve.includes(v.id);return <div key={v.id} className="crow" onClick={()=>{onToggle(v.id);setVe(p=>t?p.filter(x=>x!==v.id):[...p,v.id]);}}>
      <div style={{width:15,height:15,borderRadius:4,border:'1px solid var(--border2)',background:t?'var(--primary)':'transparent',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:9,color:'#fff'}}>{t?'✓':''}</div>
      <img src={yTh(v.yt)} style={{width:46,height:28,objectFit:'cover',borderRadius:5}} alt=""/>
      <div><div style={{fontSize:12,fontWeight:700,marginBottom:2}}>{v.tt}</div><Bd l={v.tr}/></div>
    </div>;})}
    <button className="btn btn-primary" style={{width:'100%',marginTop:14,justifyContent:'center'}} onClick={onClose}>✓ Confirmar</button>
  </Modal>;
}

// ── Modal Enviar Banco ────────────────────────────────────────────────────────
function ModalEnviarBanco({video,alunos,onToggle,onClose}){
  const [atrib,setAtrib]=useState(alunos.filter(a=>a.ve?.includes(video.id)).map(a=>a.id));
  return <Modal title={`Enviar "${video.tt.slice(0,28)}"`} onClose={onClose}>
    {alunos.filter(a=>a.ativo).map(a=>{const t=atrib.includes(a.id);return <div key={a.id} className="crow" onClick={()=>{onToggle(a.id);setAtrib(p=>t?p.filter(x=>x!==a.id):[...p,a.id]);}}>
      <div style={{width:15,height:15,borderRadius:4,border:'1px solid var(--border2)',background:t?'var(--primary)':'transparent',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:9,color:'#fff'}}>{t?'✓':''}</div>
      <Av a={a} z={28}/>
      <div><div style={{fontSize:12,fontWeight:700}}>{a.nm}</div><div style={{fontSize:10,color:'var(--text3)'}}>{a.pl}</div></div>
    </div>;})}
    <button className="btn btn-primary" style={{width:'100%',marginTop:14,justifyContent:'center'}} onClick={onClose}>✓ Confirmar</button>
  </Modal>;
}

// ── Banco de Vídeos ───────────────────────────────────────────────────────────
function BancoVideos({banco,alunos,modal,setModal,salvarVideo,excluirVideo,atualizarAluno}){
  const [busca,setBusca]=useState('');
  const [trilha,setTrilha]=useState('');
  const fl=banco.filter(v=>v.tt?.toLowerCase().includes(busca.toLowerCase())&&(!trilha||v.tr===trilha));
  return <div>
    {modal&&<ModalDespachante modal={modal} setModal={setModal} alunos={alunos} banco={banco} salvarAluno={()=>{}} salvarVideo={salvarVideo} atualizarAluno={atualizarAluno}/>}
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1.2rem'}}>
      <div><div style={{fontSize:20,fontWeight:700,letterSpacing:'-.02em'}}>Banco de vídeos</div>
      <div style={{fontSize:12,color:'var(--text2)',marginTop:3}}>Cole links do YouTube não listado e atribua aos alunos</div></div>
      <button className="btn btn-primary btn-sm" onClick={()=>setModal({tipo:'video',video:null})}>+ Novo vídeo</button>
    </div>
    <div style={{display:'flex',gap:8,marginBottom:'1.2rem'}}>
      <input className="inp" style={{flex:1}} placeholder="Buscar vídeo..." value={busca} onChange={e=>setBusca(e.target.value)}/>
      <select className="sel" value={trilha} onChange={e=>setTrilha(e.target.value)}><option value="">Todas as trilhas</option><option>Técnica</option><option>Teoria</option><option>Repertório</option></select>
    </div>
    {fl.map(v=>{
      const at=alunos.filter(a=>a.ve?.includes(v.id));
      return <div key={v.id} className="bitem">
        <div className="bimg"><img src={yTh(v.yt)} loading="lazy" alt=""/></div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:13,fontWeight:700,marginBottom:5}}>{v.tt}</div>
          <div style={{display:'flex',gap:5,alignItems:'center'}}><Bd l={v.tr}/>{v.ob&&<span style={{fontSize:10,color:'var(--text3)'}}>{v.ob}</span>}</div>
          {at.length>0&&<div style={{fontSize:10,color:'var(--text3)',marginTop:3}}>Para: {at.map(a=>a.nm.split(' ')[0]).join(', ')}</div>}
        </div>
        <div style={{display:'flex',gap:5,flexShrink:0}}>
          <button className="btn btn-primary btn-xs" onClick={()=>setModal({tipo:'enviarBanco',video:v})}>▶ Enviar</button>
          <button className="btn btn-xs" onClick={()=>setModal({tipo:'video',video:v})}>✎</button>
          <button className="btn btn-xs btn-danger" onClick={()=>excluirVideo(v.id)}>🗑</button>
        </div>
      </div>;
    })}
    {fl.length===0&&<div className="empty">Nenhum vídeo encontrado.</div>}
  </div>;
}

// ── Perfil do Aluno (professor + aluno) ───────────────────────────────────────

// ── Backlog de estudos concluídos ─────────────────────────────────────────────
function BacklogEstudos({tarefas,isDemo,onToggle,onDelete}){
  const [aberto,setAberto]=React.useState(false);
  return <div style={{marginTop:10}}>
    <button onClick={()=>setAberto(p=>!p)} style={{
      width:'100%',display:'flex',alignItems:'center',justifyContent:'space-between',
      background:'var(--surface2)',border:'1px solid var(--border)',
      borderRadius:aberto?'8px 8px 0 0':8,padding:'8px 12px',cursor:'pointer',
      fontFamily:'inherit',color:'var(--text2)',fontSize:11,fontWeight:600,
      transition:'all .15s',
    }}>
      <div style={{display:'flex',alignItems:'center',gap:7}}>
        <span style={{fontSize:14}}>✅</span>
        <span>Estudos concluídos ({tarefas.length})</span>
      </div>
      <span style={{fontSize:12,transition:'transform .2s',display:'inline-block',transform:aberto?'rotate(180deg)':'rotate(0deg)'}}>▾</span>
    </button>
    {aberto&&<div style={{
      border:'1px solid var(--border)',borderTop:'none',
      borderRadius:'0 0 8px 8px',overflow:'hidden',
      background:'var(--surface)',
    }}>
      {tarefas.map((t,i)=><div key={t.id} style={{
        display:'flex',alignItems:'center',gap:8,padding:'7px 12px',
        borderBottom:i<tarefas.length-1?'1px solid var(--border)':'none',
        background:i%2===0?'var(--surface)':'var(--surface2)',
      }}>
        <div className="ck ok" onClick={()=>onToggle(t.id)} title="Marcar como pendente">✓</div>
        <span style={{flex:1,fontSize:12,color:'var(--text3)',textDecoration:'line-through'}}>{t.tx}</span>
        {!isDemo&&<><span className={`badge ${t.pr==='Alta'?'b-green':t.pr==='Média'?'b-amber':'b-gray'}`} style={{fontSize:9}}>{t.pr}</span>
        <button onClick={()=>onDelete(t.id)} style={{background:'none',border:'none',color:'var(--text3)',cursor:'pointer',fontSize:14,padding:'0 2px',lineHeight:1}}>×</button></>}
      </div>)}
    </div>}
  </div>;
}


// ── Repertório — visão do professor ──────────────────────────────────────────
function RepertorioProfessor({a,onUpdate}){
  const [expandido,setExpandido]=React.useState(true);
  const [showAdd,setShowAdd]=React.useState(false);
  const [nome,setNome]=React.useState('');
  const [artista,setArtista]=React.useState('');

  const HOJE=Date.now(),DIA=86400000;
  function getStatus(ultimo){
    const dias=Math.floor((HOJE-(ultimo||0))/DIA);
    if(dias<14)return{s:'dominada',label:'Dominada',c:'#1DBA88',bg:'#1DBA8820',bc:'#1DBA8830'};
    if(dias<28)return{s:'revisar',label:'Revisar em breve',c:'#F0A040',bg:'#F0A04020',bc:'#F0A04030'};
    return{s:'urgente',label:'Precisa revisar',c:'#F05050',bg:'#F0505020',bc:'#F0505030'};
  }
  function diasLabel(d){return d===0?'Tocada hoje':d===1?'Há 1 dia':`Há ${d} dias`;}

  function tocarHoje(id){
    onUpdate({repertorio:(a.repertorio||[]).map(m=>m.id===id?{...m,ultimo:HOJE}:m)});
  }
  function remover(id){
    if(!window.confirm('Remover esta música?'))return;
    onUpdate({repertorio:(a.repertorio||[]).filter(m=>m.id!==id)});
  }
  function adicionar(){
    if(!nome.trim())return;
    onUpdate({repertorio:[...(a.repertorio||[]),{id:Date.now().toString(),nome:nome.trim(),artista:artista.trim(),ultimo:HOJE}]});
    setNome('');setArtista('');setShowAdd(false);
  }

  const rep=a.repertorio||[];
  const urgentes=rep.filter(m=>getStatus(m.ultimo).s==='urgente').length;
  const revisar=rep.filter(m=>getStatus(m.ultimo).s==='revisar').length;
  const dominadas=rep.filter(m=>getStatus(m.ultimo).s==='dominada').length;

  return <div style={{background:'linear-gradient(135deg,#0F1218,#161B25)',border:'1px solid var(--border)',borderRadius:'var(--radius-lg)',padding:'1.25rem',marginBottom:10,position:'relative',overflow:'hidden'}}>
    <div style={{position:'absolute',top:0,left:0,right:0,height:1,background:'linear-gradient(90deg,transparent,#F0A040,transparent)',opacity:.5}}/>

    <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:expandido?14:0}}>
      <div style={{width:32,height:32,borderRadius:8,background:'#F0A04020',border:'1px solid #F0A04040',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16}}>🎵</div>
      <div style={{flex:1}}>
        <div style={{fontSize:14,fontWeight:700}}>Repertório</div>
        <div style={{fontSize:11,color:'var(--text3)',marginTop:1}}>{rep.length} músicas{urgentes>0?` · ${urgentes} urgente${urgentes>1?'s':''} ⚠`:''}</div>
      </div>
      <div style={{display:'flex',gap:6}}>
        <button className="btn btn-sm" style={{borderColor:'#F0A04040',color:'#F0A040'}} onClick={()=>setShowAdd(p=>!p)}>+ Música</button>
        <button className="btn btn-sm" onClick={()=>setExpandido(p=>!p)}>{expandido?'▲':'▼'}</button>
      </div>
    </div>

    {showAdd&&<div style={{background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:'var(--radius)',padding:12,marginBottom:12}}>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8}}>
        <div>
          <div style={{fontSize:10,color:'var(--text2)',marginBottom:3,fontWeight:600}}>Nome da música *</div>
          <input className="inp" value={nome} onChange={e=>setNome(e.target.value)} onKeyDown={e=>e.key==='Enter'&&adicionar()} placeholder="Ex: Besame Mucho" style={{fontSize:11}}/>
        </div>
        <div>
          <div style={{fontSize:10,color:'var(--text2)',marginBottom:3,fontWeight:600}}>Artista / Estilo</div>
          <input className="inp" value={artista} onChange={e=>setArtista(e.target.value)} onKeyDown={e=>e.key==='Enter'&&adicionar()} placeholder="Ex: Bolero" style={{fontSize:11}}/>
        </div>
      </div>
      <div style={{display:'flex',gap:7,justifyContent:'flex-end'}}>
        <button className="btn btn-sm" onClick={()=>{setShowAdd(false);setNome('');setArtista('');}}>Cancelar</button>
        <button className="btn btn-primary btn-sm" onClick={adicionar}>✓ Adicionar</button>
      </div>
    </div>}

    {expandido&&<div>
      {rep.length===0&&<div style={{textAlign:'center',padding:'1.5rem',color:'var(--text3)',fontSize:12}}>
        <div style={{fontSize:24,marginBottom:6}}>🎵</div>Nenhuma música no repertório ainda.
      </div>}
      {rep.length>0&&<div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:7,marginBottom:10}}>
        {[['#1DBA88',dominadas,'Dominadas'],['#F0A040',revisar,'Revisar'],['#F05050',urgentes,'Urgente']].map(([c,n,l])=>
          <div key={l} style={{background:c+'12',border:`1px solid ${c}25`,borderRadius:8,padding:'8px',textAlign:'center'}}>
            <div style={{fontSize:18,fontWeight:700,color:c}}>{n}</div>
            <div style={{fontSize:9,color:'var(--text2)',marginTop:1,textTransform:'uppercase',letterSpacing:'.05em'}}>{l}</div>
          </div>
        )}
      </div>}
      {rep.map(m=>{
        const st=getStatus(m.ultimo);
        const dias=Math.floor((HOJE-(m.ultimo||0))/DIA);
        return <div key={m.id} style={{background:'var(--surface2)',border:`1px solid var(--border)`,borderLeft:`3px solid ${st.c}`,borderRadius:10,padding:'9px 12px',marginBottom:6,display:'flex',alignItems:'center',gap:10}}>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:13,fontWeight:700,color:'var(--text)',marginBottom:2}}>{m.nome}</div>
            <div style={{display:'flex',alignItems:'center',gap:7,flexWrap:'wrap'}}>
              {m.artista&&<span style={{fontSize:10,color:'var(--text3)'}}>{m.artista}</span>}
              <span style={{display:'inline-flex',fontSize:10,padding:'1px 8px',borderRadius:20,fontWeight:700,background:st.bg,color:st.c,border:`1px solid ${st.bc}`}}>{st.label}</span>
              <span style={{fontSize:10,color:'var(--text3)'}}>{diasLabel(dias)}</span>
            </div>
          </div>
          <div style={{display:'flex',gap:5,flexShrink:0}}>
            <button className="btn btn-primary btn-xs" onClick={()=>tocarHoje(m.id)}>🎵 Tocou</button>
            <button className="btn btn-xs btn-danger" onClick={()=>remover(m.id)}>×</button>
          </div>
        </div>;
      })}
    </div>}
  </div>;
}

function PerfilAluno({a,banco,isDemo,onVoltar,onUpdate,onEditar,onModalMural,onEnviarVideo,onExcluir,salvarAluno,modal,setModal,alunos,onFerramentas,onRepertorio}){
  const [openV,setOpenV]=useState(null);
  const [openMural,setOpenMural]=useState(null);
  const [paginaPerfil,setPaginaPerfil]=useState('home');
  const [localPags,setLocalPags]=useState(null);
  React.useEffect(()=>{setLocalPags(null);},[a.id]);

  if(!a)return null;
  const mn=mN();
  const pags=localPags||a.pags||[];
  const pagsComMes=pags.find(p=>p.mes===mn)?pags:[{mes:mn,status:'pendente'},...pags];

  const dist=cT(a.tf||[],a.td||30);
  // Verifica os 3 meses — se qualquer um estiver atrasado, alerta
  const statuses=pagsComMes.slice(0,3).map(p=>sP(p,a.dia));
  const temAtrasado=statuses.some(s=>s==='atrasado');
  const temPendente=statuses.some(s=>s==='pendente');
  const st0=temAtrasado?'atrasado':temPendente?'pendente':'pago';
  const mesesAtrasados=pagsComMes.slice(0,3).filter(p=>sP(p,a.dia)==='atrasado').map(p=>p.mes);
  const bn=st0==='pago'?{bg:'#1DBA8815',c:'#1DBA88',bc:'#1DBA8830',m:'✓ Mensalidade em dia — todos os meses pagos!'}
    :st0==='pendente'?{bg:'#F0A04015',c:'#F0A040',bc:'#F0A04030',m:`⚠ Vence dia ${a.dia} — ainda no prazo.`}
    :{bg:'#F0505015',c:'#F05050',bc:'#F0505030',m:`✕ Pagamento atrasado: ${mesesAtrasados.join(', ')}. Vencimento dia ${a.dia}.`};

  async function mP(i){const p=[...pagsComMes];p[i]={...p[i],status:'pago'};setLocalPags(p);onUpdate({pags:p});}
  async function dP(i){const p=[...pagsComMes];p[i]={...p[i],status:'pendente'};setLocalPags(p);onUpdate({pags:p});}
  async function togT(id){onUpdate({tf:(a.tf||[]).map(t=>t.id===id?{...t,feita:!t.feita}:t)});}
  async function sP2(id,pr){onUpdate({tf:(a.tf||[]).map(t=>t.id===id?{...t,pr}:t)});}
  async function addT(tx,pr){onUpdate({tf:[...(a.tf||[]),{id:Date.now().toString(),tx,feita:false,pr}]});}
  async function delT(id){onUpdate({tf:(a.tf||[]).filter(t=>t.id!==id)});}
  async function limT(){onUpdate({tf:(a.tf||[]).filter(t=>!t.feita)});}
  async function sTd(v){onUpdate({td:Math.max(5,Math.min(180,parseInt(v)||30))});}
  async function togV(vid){setOpenV(p=>p===vid?null:vid);}
  async function mEst(vid){onUpdate({es:[...(a.es||[]),vid]});}
  async function rV(vid){onUpdate({ve:(a.ve||[]).filter(x=>x!==vid)});}
  async function remMural(mid){onUpdate({mural:(a.mural||[]).filter(v=>v.id!==mid)});}

  const NewTaskBar=()=>{
    const [tx,setTx]=useState('');const [pr,setPr]=useState('Alta');
    return <div style={{display:'flex',gap:5,marginTop:10}}>
      <input className="inp" value={tx} onChange={e=>setTx(e.target.value)} placeholder="Novo estudo... (Enter)" style={{flex:1,fontSize:12}} onKeyDown={e=>{if(e.key==='Enter'&&tx.trim()){addT(tx.trim(),pr);setTx('');}}}/>
      <select className="sel" style={{fontSize:11}} value={pr} onChange={e=>setPr(e.target.value)}><option>Alta</option><option>Média</option><option>Baixa</option></select>
      <button className="btn btn-primary btn-sm" onClick={()=>{if(tx.trim()){addT(tx.trim(),pr);setTx('');}}}>+ Add</button>
    </div>;
  };

  return <div>
    <style>{G}</style>
    <div className="topbar">
      <div className="logo">
        <div className="logo-icon"><img src="https://dudu-pereira.vercel.app/favicon.ico.png" alt="Dudu Pereira logo"/></div>
        <div><div className="logo-name">Dudu Pereira</div><div className="logo-sub">{isDemo?'Minha área':'Professor'}</div></div>
      </div>
      {!isDemo&&<button className="nav-btn" onClick={()=>signOut(auth)}>Sair</button>}
      {isDemo&&onFerramentas&&<button className="nav-btn" onClick={onFerramentas} style={{color:'#1DBA88',borderColor:'#1DBA8840',background:'#1DBA8812'}}>
        <i className="ti ti-tools" aria-hidden="true"/> Ferramentas
      </button>}
    </div>

    {modal&&!isDemo&&<ModalDespachante modal={modal} setModal={setModal} alunos={alunos||[]} banco={banco} salvarAluno={salvarAluno||((dados,id)=>{})} salvarVideo={()=>{}} atualizarAluno={async(id,d)=>onUpdate(d)}/>}

    <div className="main">
      {!isDemo&&<button className="back-btn" onClick={onVoltar}>← Voltar para lista</button>}

      <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:'1.25rem'}}>
        <Av a={a} z={52}/>
        <div style={{flex:1}}>
          <div style={{display:'flex',alignItems:'center',gap:9}}>
            <span style={{fontSize:19,fontWeight:700,letterSpacing:'-.02em'}}>{a.nm}</span>
            {!a.ativo&&<Bd l="Inativo"/>}
          </div>
          <div style={{fontSize:12,color:'var(--text2)',marginTop:3}}>{(a.diasAula||[]).length>0?`📅 ${(a.diasAula||[]).join(', ')}`:''}{a.horario?` · 🕐 ${a.horario}`:''}</div>
        </div>
        {!isDemo&&<div style={{display:'flex',gap:7,flexWrap:'wrap'}}>
          <button className="btn btn-sm" style={{borderColor:'#4D9EF540',color:'#4D9EF5'}} onClick={()=>{
            const url=`${window.location.origin}/aluno/${a.id}`;
            navigator.clipboard.writeText(url).then(()=>alert(`✓ Link copiado!\n\n${url}`));
          }}>🔗 Copiar link do aluno</button>
          <button className="btn btn-sm" onClick={onEnviarVideo}>▶ Enviar vídeo</button>
          <button className="btn btn-sm" style={{borderColor:'#D4A84340',color:'#D4A843'}} onClick={onModalMural}>🎬 Mural</button>
          <button className="btn btn-sm" onClick={onEditar}>✎ Editar</button>
          <button className={`btn btn-xs ${a.ativo?'btn-danger':''}`} onClick={()=>onUpdate({ativo:!a.ativo})}>{a.ativo?'Desativar':'Ativar'}</button>
          {!isDemo&&<button className="btn btn-xs btn-danger" onClick={onExcluir}>🗑 Excluir aluno</button>}
        </div>}
      </div>

      {isDemo&&paginaPerfil==='home'&&<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
        <div onClick={()=>setPaginaPerfil('estudos')} style={{background:'linear-gradient(135deg,#1DBA8822,#1DBA8808)',border:'1px solid #1DBA8840',borderRadius:16,padding:'1.25rem',cursor:'pointer',position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:'linear-gradient(90deg,#1DBA88,#4D9EF5)',borderRadius:'16px 16px 0 0'}}/>
          <div style={{fontSize:26,marginBottom:7}}>📚</div>
          <div style={{fontSize:15,fontWeight:700,color:'var(--text)',marginBottom:4}}>Estudos</div>
          <div style={{fontSize:11,color:'var(--text2)',marginBottom:10}}>{(a.tf||[]).filter(t=>!t.feita).length} pendente{(a.tf||[]).filter(t=>!t.feita).length!==1?'s':''}</div>
          <div style={{display:'inline-flex',alignItems:'center',gap:4,fontSize:11,fontWeight:600,color:'#1DBA88'}}>Ver estudos →</div>
        </div>
        <div onClick={()=>setPaginaPerfil('mensalidade')} style={{background:'linear-gradient(135deg,#4D9EF522,#4D9EF508)',border:'1px solid #4D9EF540',borderRadius:16,padding:'1.25rem',cursor:'pointer',position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:'linear-gradient(90deg,#4D9EF5,#7B68EE)',borderRadius:'16px 16px 0 0'}}/>
          <div style={{fontSize:26,marginBottom:7}}>💰</div>
          <div style={{fontSize:15,fontWeight:700,color:'var(--text)',marginBottom:4}}>Mensalidade</div>
          <div style={{fontSize:11,color:'var(--text2)',marginBottom:10}}>{bn.m.replace('✓ ','').replace('⚠ ','').replace('✕ ','')}</div>
          <div style={{display:'inline-flex',alignItems:'center',gap:4,fontSize:11,fontWeight:600,color:'#4D9EF5'}}>Ver detalhes →</div>
        </div>
        <div onClick={()=>onRepertorio&&onRepertorio()} style={{background:'linear-gradient(135deg,#F0A04014,#D4A84312)',border:'1px solid #F0A04040',borderRadius:16,padding:'1.1rem',cursor:'pointer',position:'relative',overflow:'hidden',gridColumn:'1/-1',display:'flex',alignItems:'center',gap:14}}>
          <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:'linear-gradient(90deg,#F0A040,#D4A843)',borderRadius:'16px 16px 0 0'}}/>
          <div style={{fontSize:28,flexShrink:0}}>🎵</div>
          <div style={{flex:1}}>
            <div style={{fontSize:14,fontWeight:700,color:'var(--text)',marginBottom:3}}>Meu Repertório</div>
            <div style={{fontSize:11,color:'var(--text2)',marginBottom:6}}>
              {(()=>{const rep=a.repertorio||[];const HOJE=Date.now(),DIA=86400000;
                const urg=rep.filter(m=>Math.floor((HOJE-(m.ultimo||0))/DIA)>=28).length;
                const rev=rep.filter(m=>{const d=Math.floor((HOJE-(m.ultimo||0))/DIA);return d>=14&&d<28;}).length;
                const dom=rep.filter(m=>Math.floor((HOJE-(m.ultimo||0))/DIA)<14).length;
                return rep.length===0?'Nenhuma música ainda':`${rep.length} músicas · ${urg>0?urg+' urgente':'em dia'}`;
              })()}
            </div>
            <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
              {(()=>{const rep=a.repertorio||[];const HOJE=Date.now(),DIA=86400000;
                const urg=rep.filter(m=>Math.floor((HOJE-(m.ultimo||0))/DIA)>=28).length;
                const rev=rep.filter(m=>{const d=Math.floor((HOJE-(m.ultimo||0))/DIA);return d>=14&&d<28;}).length;
                const dom=rep.filter(m=>Math.floor((HOJE-(m.ultimo||0))/DIA)<14).length;
                return <>
                  {dom>0&&<span style={{fontSize:10,padding:'2px 8px',borderRadius:20,background:'#1DBA8820',color:'#1DBA88',border:'1px solid #1DBA8830',fontWeight:700}}>{dom} dominada{dom!==1?'s':''}</span>}
                  {rev>0&&<span style={{fontSize:10,padding:'2px 8px',borderRadius:20,background:'#F0A04020',color:'#F0A040',border:'1px solid #F0A04030',fontWeight:700}}>{rev} revisar</span>}
                  {urg>0&&<span style={{fontSize:10,padding:'2px 8px',borderRadius:20,background:'#F0505020',color:'#F05050',border:'1px solid #F0505030',fontWeight:700}}>{urg} urgente{urg!==1?'s':''}</span>}
                </>;
              })()}
            </div>
          </div>
          <div style={{fontSize:11,fontWeight:600,color:'#F0A040',flexShrink:0}}>Ver →</div>
        </div>
      </div>}

      {(!isDemo||paginaPerfil==='estudos')&&<div style={{marginBottom:12}}>
        {isDemo&&<button onClick={()=>setPaginaPerfil('home')} style={{display:'inline-flex',alignItems:'center',gap:5,fontSize:12,color:'var(--text2)',border:'none',background:'none',cursor:'pointer',fontFamily:'Sora,sans-serif',marginBottom:12,padding:0}}>
          <i className="ti ti-arrow-left" aria-hidden="true"/> Voltar
        </button>}
        <div className="card">
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
            <div className="label" style={{margin:0}}>Estudos da semana</div>
            {!isDemo&&(a.tf||[]).some(t=>t.feita)&&<button className="btn btn-xs btn-danger" onClick={limT}>🗑 Limpar</button>}
          </div>
          {(a.tf||[]).filter(t=>!t.feita).length===0&&<div style={{fontSize:12,color:'var(--text3)',padding:'0.5rem 0'}}>Nenhum estudo pendente.</div>}
          {(a.tf||[]).filter(t=>!t.feita).map(t=><div key={t.id} className="trow">
            <div className={`ck ${t.feita?'ok':''}`} onClick={()=>togT(t.id)}>{t.feita?'✓':''}</div>
            <span style={{flex:1,fontSize:12,color:'var(--text)'}}>{t.tx}</span>
            {!isDemo?<><select className="sel" style={{fontSize:10,padding:'2px 5px'}} value={t.pr} onChange={e=>sP2(t.id,e.target.value)}><option>Alta</option><option>Média</option><option>Baixa</option></select><button onClick={()=>delT(t.id)} style={{background:'none',border:'none',color:'var(--text3)',cursor:'pointer',fontSize:16,padding:'0 2px',lineHeight:1}}>×</button></>:<Bd l={t.pr}/>}
          </div>)}
          {!isDemo&&<NewTaskBar/>}
          {(a.tf||[]).filter(t=>t.feita).length>0&&<BacklogEstudos tarefas={(a.tf||[]).filter(t=>t.feita)} isDemo={isDemo} onToggle={togT} onDelete={delT}/>}
          {!isDemo&&<div style={{marginTop:12}}>
            <div className="label">Observações internas</div>
            <textarea className="ta" defaultValue={a.ob} onBlur={e=>onUpdate({ob:e.target.value})}/>
          </div>}
        </div>
      </div>}

      {(!isDemo||paginaPerfil==='mensalidade')&&<div style={{marginBottom:12}}>
        {isDemo&&<button onClick={()=>setPaginaPerfil('home')} style={{display:'inline-flex',alignItems:'center',gap:5,fontSize:12,color:'var(--text2)',border:'none',background:'none',cursor:'pointer',fontFamily:'Sora,sans-serif',marginBottom:12,padding:0}}>
          <i className="ti ti-arrow-left" aria-hidden="true"/> Voltar
        </button>}
        <div className="card">
          <div className="label">Mensalidade</div>
          <div className="banner" style={{background:bn.bg,color:bn.c,border:`1px solid ${bn.bc}`}}>{bn.m}</div>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:12}}>
            <div><div style={{fontSize:10,color:'var(--text3)',marginBottom:3}}>Valor mensal</div><div style={{fontSize:20,fontWeight:700}}>R$ {a.val}</div></div>
            <div style={{textAlign:'right'}}><div style={{fontSize:10,color:'var(--text3)',marginBottom:3}}>Vencimento</div><div style={{fontSize:16,fontWeight:700}}>Dia {a.dia}</div></div>
          </div>
          <div className="label">Histórico</div>
          {pagsComMes.slice(0,3).map((p,i)=>{
            const s=sP(p,a.dia);
            return <div key={i} className="prow">
              <span style={{fontSize:12,color:'var(--text2)'}}>{p.mes}</span>
              <div style={{display:'flex',alignItems:'center',gap:6}}>
                <Bd l={s}/>
                {!isDemo&&s!=='pago'&&<button className="btn btn-xs btn-primary" onClick={()=>mP(i)}>✓ Pago</button>}
                {!isDemo&&s==='pago'&&<button className="btn btn-xs" onClick={()=>dP(i)}>↩ Desfazer</button>}
              </div>
            </div>;
          })}
          <div style={{marginTop:14,paddingTop:12,borderTop:'1px solid var(--border)'}}>
            <div className="label">Chave Pix</div>
            <div style={{background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:8,padding:'10px 12px',display:'flex',alignItems:'center',justifyContent:'space-between',gap:10}}>
              <div>
                <div style={{fontSize:12,fontWeight:700,color:'var(--text)',letterSpacing:'.02em'}}>07341182954</div>
                <div style={{fontSize:10,color:'var(--text3)',marginTop:3}}>Maurilio Eduardo Pereira</div>
              </div>
              <button onClick={()=>{navigator.clipboard.writeText('07341182954').then(()=>{const b=document.getElementById('pix-copied');if(b){b.textContent='Copiado!';b.style.color='var(--primary)';setTimeout(()=>{b.textContent='Copiar';b.style.color='var(--text2)';},2000);}});}} style={{background:'var(--surface3)',border:'1px solid var(--border2)',borderRadius:6,padding:'5px 12px',cursor:'pointer',fontFamily:'inherit',fontWeight:600,fontSize:11,color:'var(--text2)',flexShrink:0,display:'flex',alignItems:'center',gap:5}} id="pix-btn">
                <i className="ti ti-copy" style={{fontSize:13}} aria-hidden="true"/>
                <span id="pix-copied">Copiar</span>
              </button>
            </div>
          </div>
        </div>
      </div>}

      {(a.ve||[]).length>0&&<div style={{marginBottom:12}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
          <div className="label" style={{margin:0}}>Vídeos a estudar <span style={{color:'var(--text3)',fontWeight:400}}>({(a.ve||[]).filter(id=>!(a.es||[]).includes(id)).length} pendentes)</span></div>
          {!isDemo&&<button className="btn btn-xs" onClick={onEnviarVideo}>+ Enviar</button>}
        </div>
        {(a.ve||[]).map(vid=>{
          const v=banco.find(b=>b.id===vid);if(!v)return null;
          const est=(a.es||[]).includes(vid),ab=openV===vid;
          return <div key={vid} className="vcard" style={est?{opacity:.55}:{}}>
            <div className="vt" onClick={()=>togV(vid)}>
              <div className="vimg"><img src={yTh(v.yt)} loading="lazy" alt=""/></div>
              <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,marginBottom:4}}>{v.tt}</div><div style={{display:'flex',gap:5}}><Bd l={v.tr}/>{est&&<Bd l="Estudado"/>}</div></div>
              <span style={{color:'var(--text3)',fontSize:16}}>{ab?'▲':'▶'}</span>
            </div>
            {ab&&<div style={{padding:'0 12px 12px'}}><iframe src={yEm(v.yt)} style={{width:'100%',height:220,borderRadius:8,border:'none'}} allowFullScreen title={v.tt}/></div>}
            <div className="vact">
              {!est?<button className="btn btn-primary btn-xs" onClick={()=>mEst(vid)}>✓ Marcar estudado</button>:<span style={{fontSize:11,color:'var(--primary)',fontWeight:600}}>✓ Concluído</span>}
              {!isDemo&&<button className="btn btn-xs" style={{marginLeft:'auto'}} onClick={()=>rV(vid)}>× Remover</button>}
            </div>
          </div>;
        })}
      </div>}

      {!isDemo&&<RepertorioProfessor a={a} onUpdate={onUpdate}/>}

      <div className="mural-card">
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}>
          <div className="mural-icon">🎬</div>
          <div><div style={{fontSize:14,fontWeight:700}}>Mural do Aluno</div><div style={{fontSize:11,color:'var(--text3)',marginTop:1}}>Vídeos das músicas aprendidas</div></div>
          {!isDemo&&<button className="btn btn-sm" style={{marginLeft:'auto',borderColor:'#D4A84340',color:'#D4A843'}} onClick={onModalMural}>+ Adicionar</button>}
        </div>
        {(a.mural||[]).length===0?<div style={{border:'1px dashed var(--border2)',borderRadius:'var(--radius)',padding:'2rem',textAlign:'center',color:'var(--text3)',fontSize:12}}>
          <div style={{fontSize:28,marginBottom:8}}>🎵</div>
          <div>Nenhum vídeo no mural ainda.</div>
        </div>:<div>
          {/* Grade estilo Instagram */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:3,borderRadius:12,overflow:'hidden',marginBottom:openMural?12:0}}>
            {(a.mural||[]).map(v=><div key={v.id} onClick={()=>setOpenMural(p=>p===v.id?null:v.id)} style={{
              position:'relative',aspectRatio:'1',cursor:'pointer',overflow:'hidden',
              background:'var(--surface3)',
            }}>
              <img src={yTh(v.yt)} loading="lazy" alt={v.tt} style={{width:'100%',height:'100%',objectFit:'cover',transition:'transform .2s'}}
                onMouseEnter={e=>e.target.style.transform='scale(1.05)'}
                onMouseLeave={e=>e.target.style.transform='scale(1)'}
              />
              {/* Overlay hover */}
              <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0)',transition:'background .2s',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:4,opacity:0}}
                onMouseEnter={e=>{e.currentTarget.style.background='rgba(0,0,0,0.6)';e.currentTarget.style.opacity=1;}}
                onMouseLeave={e=>{e.currentTarget.style.background='rgba(0,0,0,0)';e.currentTarget.style.opacity=0;}}
              >
                <span style={{fontSize:20}}>▶</span>
                <span style={{fontSize:10,color:'#fff',fontWeight:600,textAlign:'center',padding:'0 8px'}}>{v.tt.length>30?v.tt.slice(0,30)+'…':v.tt}</span>
              </div>
              {/* Selecionado */}
              {openMural===v.id&&<div style={{position:'absolute',inset:0,border:'3px solid var(--primary)',borderRadius:2,pointerEvents:'none'}}/>}
              {/* Badge topo */}
              <div style={{position:'absolute',top:5,left:5}}>
                <span style={{fontSize:9,fontWeight:700,background:'#D4A843',color:'#000',borderRadius:4,padding:'2px 6px'}}>🏆</span>
              </div>
              {/* Data */}
              <div style={{position:'absolute',bottom:0,left:0,right:0,background:'linear-gradient(transparent,rgba(0,0,0,0.7))',padding:'12px 5px 4px',fontSize:9,color:'rgba(255,255,255,0.8)',textAlign:'center'}}>
                {v.data}
              </div>
            </div>)}
          </div>
          {/* Player do selecionado */}
          {openMural&&(()=>{const v=(a.mural||[]).find(x=>x.id===openMural);if(!v)return null;return(
            <div style={{background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:12,overflow:'hidden',marginTop:4}}>
              <iframe src={yEm(v.yt)} style={{width:'100%',height:220,border:'none',display:'block'}} allowFullScreen title={v.tt}/>
              <div style={{padding:'10px 12px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <div>
                  <div style={{fontSize:13,fontWeight:700,marginBottom:3}}>{v.tt}</div>
                  <div style={{display:'flex',alignItems:'center',gap:7}}><Bd l="🏆 Aprendida"/><span style={{fontSize:10,color:'var(--text3)'}}>{v.data}</span></div>
                </div>
                {!isDemo&&<button className="btn btn-xs btn-danger" onClick={()=>{remMural(v.id);setOpenMural(null);}}>× Remover</button>}
              </div>
            </div>
          );})()}
        </div>}
      </div>
    </div>
  </div>;
}

const BG='#080A0F',SURF='#0F1218',SURF2='#161B25',BORDER='#1E2538',BORDER2='#28304A';
const CTEXT='#E8EBF5',TEXT2='#7A85A8',TEXT3='#3E4A68',PRIMARY='#1DBA88',CRED='#F05050';

// ── Metrônomo ─────────────────────────────────────────────────────────────────
function Metronomo(){
  const [bpm,setBpmS]=React.useState(120);
  const [comp,setComp]=React.useState(4);
  const [running,setRunning]=React.useState(false);
  const [bidx,setBidx]=React.useState(0);
  const tapRef=React.useRef([]);
  const actxRef=React.useRef(null);
  const bpmRef=React.useRef(120);
  const compRef=React.useRef(4);
  const bidxRef=React.useRef(0);
  const nextRef=React.useRef(0); // próximo tempo agendado (ctx.currentTime)
  const rafRef=React.useRef(null);
  const runRef=React.useRef(false);

  const TEMPOS=[[30,'Larghissimo'],[40,'Grave'],[50,'Largo'],[60,'Larghetto'],[66,'Adagio'],[76,'Andante'],[88,'Andantino'],[100,'Moderato'],[112,'Allegretto'],[120,'Allegro'],[140,'Vivace'],[160,'Presto'],[200,'Prestissimo'],[241,'']];
  function tname(b){for(let i=0;i<TEMPOS.length-1;i++)if(b>=TEMPOS[i][0]&&b<TEMPOS[i+1][0])return TEMPOS[i][1];return '';}

  // Click estilo Pro Tools — três osciladores, compatível desktop e mobile
  function scheduleClick(time, ac){
    const ctx=actxRef.current; if(!ctx) return;
    const freq=ac?1000:660;

    const comp=ctx.createDynamicsCompressor();
    comp.threshold.setValueAtTime(-3,time);
    comp.knee.setValueAtTime(2,time);
    comp.ratio.setValueAtTime(12,time);
    comp.attack.setValueAtTime(0.0001,time);
    comp.release.setValueAtTime(0.08,time);
    comp.connect(ctx.destination);

    const o1=ctx.createOscillator(),g1=ctx.createGain();
    o1.type='sine'; o1.frequency.value=freq;
    g1.gain.setValueAtTime(ac?1.0:0.8,time);
    g1.gain.exponentialRampToValueAtTime(0.001,time+(ac?0.045:0.065));
    o1.connect(g1); g1.connect(comp);
    o1.start(time); o1.stop(time+0.08);

    const o2=ctx.createOscillator(),g2=ctx.createGain();
    o2.type='sine'; o2.frequency.value=freq*2;
    g2.gain.setValueAtTime(ac?0.6:0.4,time);
    g2.gain.exponentialRampToValueAtTime(0.001,time+(ac?0.02:0.03));
    o2.connect(g2); g2.connect(comp);
    o2.start(time); o2.stop(time+0.04);

    const o3=ctx.createOscillator(),g3=ctx.createGain();
    o3.type='triangle'; o3.frequency.value=freq*0.5;
    g3.gain.setValueAtTime(ac?0.4:0.25,time);
    g3.gain.exponentialRampToValueAtTime(0.001,time+(ac?0.03:0.04));
    o3.connect(g3); g3.connect(comp);
    o3.start(time); o3.stop(time+0.05);
  }

  function scheduler(){
    if(!runRef.current) return;
    const ctx=actxRef.current; if(!ctx) return;
    const lookahead=0.1;
    const interval=60/bpmRef.current;
    while(nextRef.current < ctx.currentTime + lookahead){
      const ac=bidxRef.current===0;
      scheduleClick(nextRef.current, ac);
      const delay=Math.max(0,(nextRef.current-ctx.currentTime)*1000-20);
      const capBidx=bidxRef.current;
      setTimeout(()=>{if(!runRef.current)return;setBidx(capBidx);},delay);
      bidxRef.current=(bidxRef.current+1)%compRef.current;
      nextRef.current+=interval;
    }
    rafRef.current=requestAnimationFrame(scheduler);
  }

  function start(){
    if(!actxRef.current) actxRef.current=new(window.AudioContext||window.webkitAudioContext)();
    const ctx=actxRef.current;
    const doStart=()=>{
      bidxRef.current=0; setBidx(0);
      nextRef.current=ctx.currentTime+0.05;
      runRef.current=true;
      setRunning(true);
      scheduler();
    };
    if(ctx.state==='suspended') ctx.resume().then(doStart);
    else doStart();
  }

  function stop(){
    runRef.current=false;
    cancelAnimationFrame(rafRef.current);
    setRunning(false); setBidx(0); bidxRef.current=0;
  }

  function toggle(){running?stop():start();}

  function updateBpm(v){
    const nb=Math.max(30,Math.min(240,Math.round(v)));
    setBpmS(nb); bpmRef.current=nb;
  }

  function setCompasso(n){
    setComp(n); compRef.current=n; bidxRef.current=0; setBidx(0);
  }

  function doTap(){
    const now=Date.now(), arr=tapRef.current;
    if(arr.length&&now-arr[arr.length-1]>2500) arr.length=0;
    arr.push(now); if(arr.length>6) arr.shift();
    if(arr.length>=2){
      const gaps=[]; for(let i=1;i<arr.length;i++) gaps.push(arr[i]-arr[i-1]);
      updateBpm(Math.round(60000/(gaps.reduce((a,b)=>a+b)/gaps.length)));
    }
  }

  React.useEffect(()=>()=>{runRef.current=false;cancelAnimationFrame(rafRef.current);},[]);

  const sb={border:`1px solid ${BORDER2}`,background:'transparent',color:CTEXT,cursor:'pointer',fontFamily:'Sora,sans-serif'};

  return <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'1.25rem',padding:'1.5rem 0'}}>
    <div>
      <div style={{display:'flex',alignItems:'center',gap:16}}>
        <button onClick={()=>updateBpm(bpm-1)} style={{...sb,width:42,height:42,borderRadius:'50%',fontSize:24,display:'flex',alignItems:'center',justifyContent:'center'}}>−</button>
        <div style={{textAlign:'center'}}>
          <div style={{fontSize:64,fontWeight:700,color:CTEXT,letterSpacing:'-.03em',lineHeight:1,minWidth:110}}>{bpm}</div>
          <div style={{fontSize:10,color:TEXT3,textTransform:'uppercase',letterSpacing:'.07em',marginTop:3}}>BPM</div>
        </div>
        <button onClick={()=>updateBpm(bpm+1)} style={{...sb,width:42,height:42,borderRadius:'50%',fontSize:24,display:'flex',alignItems:'center',justifyContent:'center'}}>+</button>
      </div>
      <div style={{fontSize:13,color:TEXT2,textAlign:'center',marginTop:6}}>{tname(bpm)}</div>
    </div>

    <input type="range" min="30" max="240" value={bpm} step="1"
      style={{width:'100%',maxWidth:320,accentColor:PRIMARY}}
      onChange={e=>updateBpm(+e.target.value)}/>

    <div style={{display:'flex',gap:6}}>
      {[2,4,3,6].map(n=><button key={n} onClick={()=>setCompasso(n)} style={{...sb,padding:'6px 16px',borderRadius:20,border:`1px solid ${comp===n?PRIMARY:BORDER2}`,background:comp===n?PRIMARY:'transparent',color:comp===n?'#fff':TEXT2,fontSize:13}}>{n===6?'6/8':`${n}/4`}</button>)}
    </div>

    <div style={{display:'flex',gap:10}}>
      {Array.from({length:comp},(_,i)=><div key={i} style={{
        width:36,height:36,borderRadius:'50%',
        border:`1.5px solid ${i===bidx?(i===0?CRED:PRIMARY):BORDER2}`,
        background:i===bidx?(i===0?CRED:PRIMARY):SURF2,
        display:'flex',alignItems:'center',justifyContent:'center',
        fontSize:12,color:i===bidx?'#fff':TEXT3,
        fontWeight:i===bidx?700:400,
        transition:'background .08s,border-color .08s',
      }}>{i+1}</div>)}
    </div>

    <div style={{display:'flex',gap:12,alignItems:'center',marginTop:8}}>
      <button onClick={doTap} style={{...sb,padding:'8px 20px',borderRadius:20,fontSize:13,color:TEXT2}}>Tap</button>
      <button onClick={toggle} style={{width:64,height:64,borderRadius:'50%',border:'none',background:running?CRED:PRIMARY,color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,cursor:'pointer',transition:'background .2s'}}>
        <i className={`ti ${running?'ti-player-pause':'ti-player-play'}`} aria-hidden="true"/>
      </button>
      <button onClick={()=>updateBpm(120)} style={{...sb,padding:'8px 20px',borderRadius:20,fontSize:13,color:TEXT2}}>Reset</button>
    </div>

  </div>;
}

// ── Ferramentas ────────────────────────────────────────────────────────────────
function Ferramentas({onVoltar}){
  const [pagina,setPagina]=React.useState('lista');
  const topbar=(title,onBack,backLabel)=><div style={{background:SURF,borderBottom:`1px solid ${BORDER}`,padding:'0 1.5rem',height:56,display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:50}}>
    <div style={{display:'flex',alignItems:'center',gap:10}}>
      <img src="https://dudu-pereira.vercel.app/favicon.ico.png" alt="" style={{width:30,height:30,borderRadius:8}}/>
      <span style={{fontSize:15,fontWeight:700,color:CTEXT,fontFamily:'Sora,sans-serif'}}>{title}</span>
    </div>
    <button onClick={onBack} style={{display:'inline-flex',alignItems:'center',gap:5,fontSize:12,color:TEXT2,border:`1px solid ${BORDER2}`,background:'transparent',cursor:'pointer',fontFamily:'Sora,sans-serif',padding:'5px 12px',borderRadius:20}}>
      <i className="ti ti-arrow-left" aria-hidden="true"/> {backLabel}
    </button>
  </div>;

  if(pagina==='metronomo') return <div style={{fontFamily:'Sora,sans-serif',background:BG,minHeight:'100vh'}}>
    {topbar('Metrônomo',()=>setPagina('lista'),'← Ferramentas')}
    <div style={{maxWidth:500,margin:'0 auto',padding:'0 1.5rem'}}><Metronomo/></div>
  </div>;

  return <div style={{fontFamily:'Sora,sans-serif',background:BG,minHeight:'100vh'}}>
    {topbar('Ferramentas',onVoltar,'Voltar')}
    <div style={{maxWidth:600,margin:'0 auto',padding:'1.5rem'}}>
      <div style={{fontSize:12,color:TEXT2,marginBottom:'1.25rem'}}>Recursos para seu estudo</div>
      <div onClick={()=>setPagina('metronomo')} style={{background:SURF,border:`1px solid ${BORDER}`,borderRadius:16,padding:'1rem 1.1rem',display:'flex',alignItems:'center',gap:14,cursor:'pointer',marginBottom:8}}>
        <div style={{width:44,height:44,borderRadius:10,background:`${PRIMARY}18`,border:`1px solid ${PRIMARY}25`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,color:PRIMARY,flexShrink:0}}>
          <i className="ti ti-clock" aria-hidden="true"/>
        </div>
        <div style={{flex:1}}>
          <div style={{fontSize:14,fontWeight:700,color:CTEXT,marginBottom:3}}>Metrônomo</div>
          <div style={{fontSize:11,color:TEXT2}}>BPM · Compasso · Click · Pêndulo visual</div>
        </div>
        <i className="ti ti-chevron-right" style={{fontSize:16,color:TEXT3}} aria-hidden="true"/>
      </div>
      <div style={{background:SURF,border:`1px solid ${BORDER}`,borderRadius:16,padding:'1rem 1.1rem',display:'flex',alignItems:'center',gap:14,opacity:.45}}>
        <div style={{width:44,height:44,borderRadius:10,background:'#7B68EE18',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,color:'#7B68EE',flexShrink:0}}>
          <i className="ti ti-music" aria-hidden="true"/>
        </div>
        <div>
          <div style={{fontSize:14,fontWeight:700,color:CTEXT,marginBottom:3}}>Afinador</div>
          <div style={{fontSize:11,color:TEXT2}}>Em breve</div>
        </div>
      </div>
    </div>
  </div>;
}


// ── Repertório ────────────────────────────────────────────────────────────────
function Repertorio({a,isDemo,onUpdate,onVoltar}){
  const [showModal,setShowModal]=useState(false);
  const [nome,setNome]=useState('');
  const [artista,setArtista]=useState('');

  const HOJE=Date.now();
  const DIA=86400000;

  function getStatus(ultimo){
    const dias=Math.floor((HOJE-(ultimo||0))/DIA);
    if(dias<14) return {s:'dominada',label:'Dominada',c:'#1DBA88',bg:'#1DBA8820',bc:'#1DBA8830',cls:'green',dias};
    if(dias<28) return {s:'revisar',label:'Revisar em breve',c:'#F0A040',bg:'#F0A04020',bc:'#F0A04030',cls:'amber',dias};
    return {s:'urgente',label:'Precisa revisar',c:'#F05050',bg:'#F0505020',bc:'#F0505030',cls:'red',dias};
  }

  function diasLabel(dias){
    if(dias===0) return 'Tocada hoje';
    if(dias===1) return 'Há 1 dia';
    return `Há ${dias} dias`;
  }

  function tocarHoje(id){
    const rep=(a.repertorio||[]).map(m=>m.id===id?{...m,ultimo:HOJE}:m);
    onUpdate({repertorio:rep});
  }

  function adicionar(){
    if(!nome.trim()) return;
    const rep=[...(a.repertorio||[]),{id:Date.now().toString(),nome:nome.trim(),artista:artista.trim(),ultimo:HOJE}];
    onUpdate({repertorio:rep});
    setNome('');setArtista('');setShowModal(false);
  }

  function remover(id){
    if(!window.confirm('Remover esta música do repertório?')) return;
    onUpdate({repertorio:(a.repertorio||[]).filter(m=>m.id!==id)});
  }

  const rep=a.repertorio||[];
  const urgentes=rep.filter(m=>getStatus(m.ultimo).s==='urgente');
  const revisar=rep.filter(m=>getStatus(m.ultimo).s==='revisar');
  const dominadas=rep.filter(m=>getStatus(m.ultimo).s==='dominada');

  const sb={border:'1px solid #28304A',background:'transparent',color:'#E8EBF5',cursor:'pointer',fontFamily:'Sora,sans-serif'};

  const MusicCard=({m})=>{
    const st=getStatus(m.ultimo);
    return <div style={{background:SURF,border:`1px solid ${BORDER}`,borderLeft:`3px solid ${st.c}`,borderRadius:12,padding:'1rem 1.1rem',marginBottom:8}}>
      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:10}}>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:13,fontWeight:700,color:CTEXT,marginBottom:3}}>{m.nome}</div>
          <div style={{fontSize:11,color:TEXT2,marginBottom:7}}>{m.artista||'—'}</div>
          <div style={{display:'flex',alignItems:'center',gap:7,flexWrap:'wrap'}}>
            <span style={{display:'inline-flex',fontSize:10,padding:'2px 9px',borderRadius:20,fontWeight:700,background:st.bg,color:st.c,border:`1px solid ${st.bc}`}}>{st.label}</span>
            <span style={{fontSize:10,color:TEXT3}}>{diasLabel(st.dias)}</span>
          </div>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:5,flexShrink:0}}>
          <button onClick={()=>tocarHoje(m.id)} style={{...sb,padding:'5px 10px',fontSize:10,background:PRIMARY,border:'none',color:'#fff',borderRadius:7}}>🎵 Toquei hoje</button>
          {!isDemo&&<button onClick={()=>remover(m.id)} style={{...sb,padding:'3px 8px',fontSize:10,color:CRED,borderColor:'#F0505030'}}>× Remover</button>}
        </div>
      </div>
    </div>;
  };

  return <div style={{fontFamily:'Sora,sans-serif',background:BG,minHeight:'100vh'}}>
    <div style={{background:SURF,borderBottom:`1px solid ${BORDER}`,padding:'0 1.5rem',height:56,display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:50}}>
      <div style={{display:'flex',alignItems:'center',gap:10}}>
        <img src="https://dudu-pereira.vercel.app/favicon.ico.png" alt="" style={{width:30,height:30,borderRadius:8}}/>
        <span style={{fontSize:15,fontWeight:700,color:CTEXT,fontFamily:'Sora,sans-serif'}}>Meu Repertório</span>
      </div>
      <div style={{display:'flex',gap:8}}>
        <button onClick={()=>setShowModal(true)} style={{...sb,padding:'5px 13px',fontSize:12,borderRadius:20,background:PRIMARY,border:'none',color:'#fff'}}>+ Adicionar</button>
        <button onClick={onVoltar} style={{...sb,padding:'5px 13px',fontSize:12,borderRadius:20}}>← Voltar</button>
      </div>
    </div>

    <div style={{maxWidth:600,margin:'0 auto',padding:'1.5rem'}}>
      {urgentes.length>0&&<div style={{background:'#F0505015',border:'1px solid #F0505030',borderRadius:10,padding:'10px 14px',marginBottom:14,display:'flex',alignItems:'center',gap:10}}>
        <span style={{fontSize:20,flexShrink:0}}>🔴</span>
        <div>
          <div style={{fontSize:12,fontWeight:700,color:CRED}}>{urgentes.length} música{urgentes.length>1?'s':''} precisando de revisão urgente</div>
          <div style={{fontSize:11,color:TEXT2,marginTop:2}}>Faz mais de 28 dias sem tocar</div>
        </div>
      </div>}

      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,marginBottom:16}}>
        {[['#1DBA88',dominadas.length,'Dominadas'],['#F0A040',revisar.length,'Revisar'],['#F05050',urgentes.length,'Urgente']].map(([c,n,l])=>
          <div key={l} style={{background:c+'12',border:`1px solid ${c}25`,borderRadius:10,padding:'10px',textAlign:'center'}}>
            <div style={{fontSize:22,fontWeight:700,color:c}}>{n}</div>
            <div style={{fontSize:10,color:TEXT2,marginTop:2}}>{l}</div>
          </div>
        )}
      </div>

      {[[urgentes,'🔴 Precisa revisar agora'],[revisar,'🟡 Revisar em breve'],[dominadas,'🟢 Dominadas']].map(([list,label])=>
        list.length>0&&<div key={label}>
          <div style={{fontSize:10,fontWeight:700,color:TEXT3,textTransform:'uppercase',letterSpacing:'.1em',marginBottom:8,marginTop:14}}>{label}</div>
          {list.map(m=><MusicCard key={m.id} m={m}/>)}
        </div>
      )}

      {rep.length===0&&<div style={{textAlign:'center',padding:'3rem',color:TEXT3,fontSize:13}}>
        <div style={{fontSize:32,marginBottom:10}}>🎵</div>
        <div>Nenhuma música no repertório ainda.</div>
        <div style={{fontSize:11,marginTop:6,color:TEXT3}}>Toque em "+ Adicionar" para começar</div>
      </div>}
    </div>

    {showModal&&<div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.75)',backdropFilter:'blur(8px)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem'}} onClick={e=>{if(e.target===e.currentTarget)setShowModal(false);}}>
      <div style={{background:SURF,border:`1px solid ${BORDER2}`,borderRadius:20,padding:'1.5rem',width:340,maxWidth:'100%'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
          <span style={{fontSize:15,fontWeight:700,color:CTEXT}}>Nova música</span>
          <button onClick={()=>setShowModal(false)} style={{background:'none',border:'none',color:TEXT2,cursor:'pointer',fontSize:20,lineHeight:1}}>×</button>
        </div>
        <div style={{marginBottom:10}}>
          <div style={{fontSize:11,color:TEXT2,marginBottom:4,fontWeight:600}}>Nome da música *</div>
          <input value={nome} onChange={e=>setNome(e.target.value)} onKeyDown={e=>e.key==='Enter'&&adicionar()} placeholder="Ex: Besame Mucho" style={{border:`1px solid ${BORDER}`,borderRadius:7,padding:'8px 10px',fontSize:13,background:SURF2,color:CTEXT,width:'100%',fontFamily:'Sora,sans-serif'}}/>
        </div>
        <div style={{marginBottom:16}}>
          <div style={{fontSize:11,color:TEXT2,marginBottom:4,fontWeight:600}}>Artista / Estilo</div>
          <input value={artista} onChange={e=>setArtista(e.target.value)} onKeyDown={e=>e.key==='Enter'&&adicionar()} placeholder="Ex: Trio Los Panchos · Bolero" style={{border:`1px solid ${BORDER}`,borderRadius:7,padding:'8px 10px',fontSize:13,background:SURF2,color:CTEXT,width:'100%',fontFamily:'Sora,sans-serif'}}/>
        </div>
        <button onClick={adicionar} style={{width:'100%',padding:'10px',borderRadius:10,background:PRIMARY,border:'none',color:'#fff',fontWeight:700,fontSize:14,cursor:'pointer',fontFamily:'Sora,sans-serif'}}>✓ Adicionar ao repertório</button>
      </div>
    </div>}
  </div>;
}

// ── Área do Aluno (link público) ──────────────────────────────────────────────
function AlunoPublico({initPage}){
  const {id}=useParams();
  const [aluno,setAluno]=useState(null);
  const [banco,setBanco]=useState([]);
  const [loading,setLoading]=useState(true);
  const [aviso,setAviso]=useState(null);
  const [avisoFechado,setAvisoFechado]=useState(false);
  const [paginaAluno,setPaginaAluno]=useState(initPage||'perfil');
  const [alunoRepertorios,setAlunoRepertorios]=useState(null);

  useEffect(()=>{
    getDoc(doc(db,'alunos',id)).then(d=>{
      if(d.exists())setAluno({id:d.id,...d.data()});
      setLoading(false);
    });
    getDocs(collection(db,'banco')).then(snap=>{
      setBanco(snap.docs.map(d=>({id:d.id,...d.data()})));
    });
    // Busca aviso mais recente
    getDocs(collection(db,'avisos')).then(snap=>{
      if(snap.empty)return;
      const lista=snap.docs.map(d=>({id:d.id,...d.data()}));
      lista.sort((a,b)=>(b.criadoEm||0)-(a.criadoEm||0));
      const ultimo=lista[0];
      // Verifica se já foi fechado nesta sessão
      const jaFechou=sessionStorage.getItem('aviso-fechado-'+ultimo.id);
      if(!jaFechou)setAviso(ultimo);
    });
  },[id]);

  if(loading)return <SplashScreen/>;
  if(!aluno)return <div className="loading" style={{fontFamily:'Sora,sans-serif'}}><style>{G}</style><div style={{textAlign:'center'}}><div style={{fontSize:32,marginBottom:12}}>♪</div><div>Aluno não encontrado.</div></div></div>;

  function fecharAviso(){
    if(aviso)sessionStorage.setItem('aviso-fechado-'+aviso.id,'1');
    setAvisoFechado(true);
  }

  if(paginaAluno==='ferramentas') return <Ferramentas onVoltar={()=>setPaginaAluno('perfil')}/>;
  if(paginaAluno==='repertorio'&&aluno) return <Repertorio a={aluno} isDemo={true} onUpdate={async(dados)=>{await updateDoc(doc(db,'alunos',aluno.id),dados);setAluno(a=>({...a,...dados}));}} onVoltar={()=>setPaginaAluno('perfil')}/>;

  return <div>
    {aviso&&!avisoFechado&&<div style={{
      position:'fixed',inset:0,background:'rgba(0,0,0,0.75)',
      backdropFilter:'blur(8px)',zIndex:999,
      display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem',
    }}>
      <div style={{
        background:'var(--surface)',border:'1px solid var(--border2)',
        borderRadius:20,padding:'2rem',maxWidth:420,width:'100%',
        boxShadow:'0 24px 80px rgba(0,0,0,0.6)',
        position:'relative',overflow:'hidden',
      }}>
        <div style={{position:'absolute',top:0,left:0,right:0,height:3,background:'linear-gradient(90deg,#1DBA88,#4D9EF5)'}}/>
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:16}}>
          <div style={{width:40,height:40,borderRadius:10,background:'#F0A04020',border:'1px solid #F0A04040',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>📢</div>
          <div>
            <div style={{fontSize:15,fontWeight:700,color:'var(--text)'}}>Aviso do Professor</div>
            <div style={{fontSize:11,color:'var(--text3)',marginTop:2}}>Dudu Pereira</div>
          </div>
        </div>
        <div style={{fontSize:14,color:'var(--text)',lineHeight:1.7,marginBottom:20,padding:'12px',background:'var(--surface2)',borderRadius:10,border:'1px solid var(--border)'}}>
          {aviso.texto}
        </div>
        <button onClick={fecharAviso} style={{
          width:'100%',padding:'10px',borderRadius:10,
          background:'linear-gradient(135deg,#1DBA88,#0F8860)',
          border:'none',color:'#fff',fontWeight:700,fontSize:14,
          cursor:'pointer',fontFamily:'inherit',
        }}>Entendido ✓</button>
      </div>
    </div>}
    <PerfilAluno a={aluno} banco={banco} isDemo={true} onVoltar={()=>{}} onUpdate={()=>{}} onEditar={()=>{}} onModalMural={()=>{}} onEnviarVideo={()=>{}} onExcluir={()=>{}} salvarAluno={()=>{}} modal={null} setModal={()=>{}} alunos={[]} onFerramentas={()=>setPaginaAluno('ferramentas')} onRepertorio={()=>setPaginaAluno('repertorio')}/>
  </div>;
}

// ── APP ROOT ──────────────────────────────────────────────────────────────────
export default function App(){
  const [user,setUser]=useState(undefined);

  useEffect(()=>{
    return onAuthStateChanged(auth,u=>setUser(u));
  },[]);

  if(user===undefined)return <SplashScreen/>;

  return <BrowserRouter>
    <Routes>
      <Route path="/aluno/:id" element={<AlunoPublico/>}/>
      <Route path="/aluno/:id/ferramentas" element={<AlunoPublico initPage="ferramentas"/>}/>
      <Route path="/*" element={
        user?<Professor/>:<Login onLogin={()=>{}}/>
      }/>
    </Routes>
  </BrowserRouter>;
}
