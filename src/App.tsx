// @ts-nocheckimport { useState, useCallback, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL  = "https://mmjadwmtfpfvvedybvmn.supabase.co";
const SUPABASE_KEY  = "sb_publishable_xw0NlfE9BOT9kM4bZ_dhjA_p9Rw5-42";
const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

const POINT_VALUE  = 0.50;
const POINTS_DENOM = 1000;
const MAX_DISC_PCT = 0.30;
const PAY_OPTS     = ["efectivo","tarjeta","QR"];
const CATEGORIES   = ["Perro","Gato","Accesorios","Granja","Golosinas"];
const todayStr     = () => new Date().toISOString().split("T")[0];

const CAT_STYLE: Record<string,string[]> = {
  "Perro":      ["#060f1a","#4488ff22","#5599ff","🐶"],
  "Gato":       ["#0a080f","#cc44ff22","#dd66ff","🐱"],
  "Accesorios": ["#080f0a","#44dd8822","#55ee99","🛍️"],
  "Granja":     ["#0a0900","#aacc0022","#ccee44","🌾"],
  "Golosinas":  ["#0a0508","#ff44aa22","#ff88cc","🍬"],
};
const PAY_STYLE: Record<string,string[]> = {
  "efectivo":["#031508","#00994422","#00bb55"],
  "tarjeta": ["#030d1a","#2266ee22","#3388ff"],
  "QR":      ["#0a0a03","#aacc0022","#ccee00"],
  "admin":   ["#12040e","#dd44aa22","#ff66cc"],
  "vendedor":["#031212","#00bbbb22","#00dddd"],
  "granel":  ["#031508","#00cc6622","#00ee77"],
  "bulto":   ["#030a18","#2288ff22","#44aaff"],
  "unidad":  ["#0a0808","#ff882222","#ff9944"],
};

const fmtW = (kg:number) => {
  if(kg===0) return "0 g";
  if(Math.abs(kg)<1) return `${Math.round(kg*1000)} g`;
  if(Math.abs(kg)<10) return `${parseFloat(kg.toFixed(3))} kg`;
  return `${parseFloat(kg.toFixed(2))} kg`;
};

const IP:Record<string,string> = {
  db:"M3 3h7v7H3zm11 0h7v7h-7zM3 14h7v7H3zm11 0h7v7h-7z",
  cart:"M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0",
  hist:"M12 8v4l3 3M12 2a10 10 0 100 20A10 10 0 0012 2z",
  box:"M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z",
  users:"M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100 8 4 4 0 000-8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75",
  cash:"M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6",
  star:"M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  out:"M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9",
  plus:"M12 5v14M5 12h14",
  edit:"M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z",
  del:"M3 6h18M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2",
  ok:"M20 6L9 17l-5-5",
  x:"M18 6L6 18M6 6l12 12",
  eye:"M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 100 6 3 3 0 000-6z",
  srch:"M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.35-4.35",
  gift:"M20 12v10H4V12M22 7H2v5h20V7zM12 22V7M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z",
  shld:"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  usr:"M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 3a4 4 0 100 8 4 4 0 000-8z",
  warn:"M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01",
  trend:"M23 6L13.5 15.5 8.5 10.5 1 18M17 6h6v6",
  key:"M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4",
  prt:"M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6v-8z",
  pfil:"M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 3a4 4 0 100 8 4 4 0 000-8zM17 11l2 2 4-4",
  spin:"M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83",
  stk:"M3 3h18v4H3zM3 10h18v4H3zM3 17h18v4H3z",
  loc:"M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
  rpt:"M18 20V10M12 20V4M6 20v-6",
  chev:"M6 9l6 6 6-6",
};

const Ic = ({n,s=16,c="currentColor"}:{n:string,s?:number,c?:string}) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    {(IP[n]||"").split("M").slice(1).map((d,i)=><path key={i} d={"M"+d}/>)}
  </svg>
);

const Lbl = ({t}:{t:string}) => <div style={{fontSize:9,fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:"#3d5060",marginBottom:5}}>{t}</div>;
const Inp = ({sx,...p}:any) => (
  <input {...p} style={{background:"#060f1a",border:"1px solid #192a38",color:"#bdd0e0",padding:"9px 12px",borderRadius:6,fontFamily:"inherit",fontSize:13,outline:"none",width:"100%",boxSizing:"border-box",transition:"border .15s",...sx}}
    onFocus={(e:any)=>e.target.style.borderColor="#00d4ff"} onBlur={(e:any)=>e.target.style.borderColor="#192a38"}/>
);
const Sel = ({sx,children,...p}:any) => (
  <select {...p} style={{background:"#060f1a",border:"1px solid #192a38",color:"#bdd0e0",padding:"9px 12px",borderRadius:6,fontFamily:"inherit",fontSize:13,outline:"none",width:"100%",boxSizing:"border-box",...sx}}>
    {children}
  </select>
);
const Chip = ({t}:{t:string}) => {
  const s=PAY_STYLE[t]||CAT_STYLE[t]||["#111","#44444422","#777"];
  const[bg,bd,tx]=s;
  return <span style={{display:"inline-flex",alignItems:"center",gap:4,padding:"2px 9px",borderRadius:20,fontSize:9,fontWeight:700,letterSpacing:.8,background:bg,border:`1px solid ${bd}`,color:tx,textTransform:"uppercase",whiteSpace:"nowrap"}}>{t}</span>;
};
const Modal = ({close,children,w=520}:any) => (
  <div onClick={(e:any)=>e.target===e.currentTarget&&close()} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.85)",backdropFilter:"blur(10px)",zIndex:4000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
    <div style={{background:"#060f1a",border:"1px solid #192a38",borderRadius:14,width:"100%",maxWidth:w,maxHeight:"92vh",overflowY:"auto",boxShadow:"0 50px 120px rgba(0,0,0,.9)"}}>
      {children}
    </div>
  </div>
);
const Card = ({children,sx}:any) => <div style={{background:"#0b1825",border:"1px solid #192a38",borderRadius:10,...sx}}>{children}</div>;
const Btn = ({v="g",children,sx,...p}:any) => {
  const vs:any={
    g:{bg:"#008833",fg:"#011208",hv:"#00aa44"},
    b:{bg:"#082244",fg:"#3388ff",hv:"#0c2a54",bd:"1px solid #143a7a"},
    gh:{bg:"transparent",fg:"#3d5060",hv:"#0b1825",bd:"1px solid #192a38"},
    r:{bg:"#180505",fg:"#ff5555",hv:"#200808",bd:"1px solid #300a0a"},
    or:{bg:"#140800",fg:"#ff9900",hv:"#1c1000",bd:"1px solid #301800"},
    cy:{bg:"#011518",fg:"#00d4ff",hv:"#021c20",bd:"1px solid #003a44"},
    pu:{bg:"#0e040f",fg:"#cc44ff",hv:"#14061a",bd:"1px solid #2a0a30"},
  }[v]||{};
  return <button {...p} style={{display:"inline-flex",alignItems:"center",gap:6,padding:"9px 16px",borderRadius:7,cursor:"pointer",fontFamily:"inherit",fontSize:11,fontWeight:700,letterSpacing:.8,textTransform:"uppercase",border:vs.bd||"none",background:vs.bg,color:vs.fg,transition:"all .15s",...sx}}
    onMouseEnter={(e:any)=>{e.currentTarget.style.background=vs.hv;e.currentTarget.style.transform="translateY(-1px)"}}
    onMouseLeave={(e:any)=>{e.currentTarget.style.background=vs.bg;e.currentTarget.style.transform=""}}>{children}</button>;
};
const Stat = ({label,value,sub,color="#00d4ff",icon}:any) => (
  <Card sx={{padding:"17px 20px",position:"relative",overflow:"hidden"}}>
    <div style={{position:"absolute",right:12,top:12,opacity:.07}}><Ic n={icon} s={48} c={color}/></div>
    <div style={{fontSize:8,fontWeight:700,letterSpacing:3,color:"#2a3d50",textTransform:"uppercase",marginBottom:8}}>{label}</div>
    <div style={{fontSize:26,fontWeight:800,color,fontVariantNumeric:"tabular-nums",lineHeight:1}}>{value}</div>
    {sub&&<div style={{fontSize:10,color:"#2a3d50",marginTop:4}}>{sub}</div>}
  </Card>
);

const mapUser   = (r:any) => r?({id:r.id,name:r.name,username:r.username,password:r.password,role:r.role,local:r.local||"",active:r.active}):null;
const mapProd   = (r:any) => r?({id:r.id,code:r.code||"",name:r.name,cat:r.cat,unit:r.unit,pricePerKg:Number(r.price_per_kg)||0,bulkWeight:Number(r.bulk_weight)||0,bulkPrice:Number(r.bulk_price)||0,unitPrice:Number(r.unit_price)||0,stk:Number(r.stk)||0,min:Number(r.min_stk)||0,active:r.active}):null;
const mapStock  = (r:any) => r?({id:r.id,productId:r.product_id,localName:r.local_name,stk:Number(r.stk)||0,min:Number(r.min_stk)||0}):null;
const mapClient = (r:any) => r?({id:r.id,name:r.name,dni:r.dni||"",phone:r.phone||"",email:r.email||"",addr:r.addr||"",pay:r.pay||"efectivo",pts:Number(r.pts)||0,active:r.active}):null;
const mapSale   = (r:any) => r?({id:r.id,date:r.date,cid:r.cid,items:r.items||[],sub:Number(r.sub)||0,disc:Number(r.disc)||0,total:Number(r.total)||0,pay:r.pay,ptsE:r.pts_e||0,ptsS:r.pts_s||0,uid:r.uid,localName:r.local_name||""}):null;
const mapCaja   = (r:any) => r?({id:r.id,closedAt:r.closed_at,closedBy:r.closed_by,closedByName:r.closed_by_name||"",saleIds:r.sale_ids||[],byPay:r.by_pay||{},totalEf:Number(r.total_ef)||0,totalDig:Number(r.total_dig)||0,totalAll:Number(r.total_all)||0,openingAmount:Number(r.opening_amount)||0,notes:r.notes||"",salesCount:r.sales_count||0,localName:r.local_name||""}):null;
const mapLocale = (r:any) => r?({id:r.id,name:r.name}):null;

const Login = ({onLogin}:any) => {
  const[un,setUn]=useState("");const[pw,setPw]=useState("");const[err,setErr]=useState("");const[loading,setLoading]=useState(false);
  const go=async()=>{
    setLoading(true);setErr("");
    try{
      const{data,error}=await sb.from("gp_users").select("*").eq("username",un).eq("password",pw).eq("active",true).single();
      if(error||!data) setErr("Usuario o contraseña incorrectos");
      else onLogin(mapUser(data));
    }catch(e){setErr("Error de conexión.");}
    setLoading(false);
  };
  return(
    <div style={{minHeight:"100vh",background:"#030810",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{width:380,padding:"42px 36px",background:"#060f1a",border:"1px solid #192a38",borderRadius:18,boxShadow:"0 50px 100px rgba(0,0,0,.8)"}}>
        <div style={{textAlign:"center",marginBottom:30}}>
          <div style={{fontSize:40,marginBottom:10}}>🐾</div>
          <div style={{fontSize:24,fontWeight:800,color:"#bdd0e0",letterSpacing:-1}}>GranelPro</div>
          <div style={{fontSize:9,color:"#2a3d50",letterSpacing:3,marginTop:3}}>SISTEMA PET SHOP · ONLINE</div>
        </div>
        <div style={{marginBottom:12}}><Lbl t="Usuario"/><Inp placeholder="usuario" value={un} onChange={(e:any)=>setUn(e.target.value)} onKeyDown={(e:any)=>e.key==="Enter"&&go()}/></div>
        <div style={{marginBottom:18}}><Lbl t="Contraseña"/><Inp type="password" placeholder="••••••••" value={pw} onChange={(e:any)=>setPw(e.target.value)} onKeyDown={(e:any)=>e.key==="Enter"&&go()}/></div>
        {err&&<div style={{background:"#110305",border:"1px solid #2a0808",borderRadius:7,padding:"8px 12px",fontSize:12,color:"#ff8888",marginBottom:12,display:"flex",gap:7,alignItems:"center"}}><Ic n="warn" s={13}/>{err}</div>}
        <Btn v="g" sx={{width:"100%",justifyContent:"center",fontSize:13,padding:"12px"}} onClick={go} disabled={loading}>
          {loading?<><Ic n="spin" s={14}/>Ingresando...</>:<><Ic n="key" s={14}/>Ingresar</>}
        </Btn>
        <div style={{marginTop:16,fontSize:9,color:"#192a38",textAlign:"center"}}>GranelPro Pet Shop · Sistema en la nube</div>
      </div>
    </div>
  );
};

export default function App() {
  const[session,setSession]=useState<any>(()=>{try{const s=sessionStorage.getItem("gp_sess");return s?JSON.parse(s):null;}catch{return null;}});
  const[users,setUsers]=useState<any[]>([]);
  const[prods,setProds]=useState<any[]>([]);
  const[stock,setStock]=useState<any[]>([]);
  const[clients,setClients]=useState<any[]>([]);
  const[sales,setSales]=useState<any[]>([]);
  const[caja,setCaja]=useState<any[]>([]);
  const[locales,setLocales]=useState<any[]>([]);
  const[loading,setLoading]=useState(true);
  const[view,setView]=useState("dash");
  const[toast,setToast]=useState<any>(null);
  const[online,setOnline]=useState(navigator.onLine);
  const isAdmin=session?.role==="admin";

  const notify=(msg:string,t="ok")=>{setToast({msg,t});setTimeout(()=>setToast(null),3400);};

  useEffect(()=>{
    const on=()=>setOnline(true);const off=()=>setOnline(false);
    window.addEventListener("online",on);window.addEventListener("offline",off);
    return()=>{window.removeEventListener("online",on);window.removeEventListener("offline",off);};
  },[]);

  const loadAll=useCallback(async()=>{
    try{
      const[u,p,sk,c,s,cj,lc]=await Promise.all([
        sb.from("gp_users").select("*").order("id"),
        sb.from("gp_products").select("*").order("id"),
        sb.from("gp_stock").select("*"),
        sb.from("gp_clients").select("*").order("id"),
        sb.from("gp_sales").select("*").order("id",{ascending:false}).limit(500),
        sb.from("gp_caja").select("*").order("id"),
        sb.from("gp_locales").select("*").order("id"),
      ]);
      if(!u.error) setUsers((u.data||[]).map(mapUser));
      if(!p.error) setProds((p.data||[]).map(mapProd));
      if(!sk.error) setStock((sk.data||[]).map(mapStock));
      if(!c.error) setClients((c.data||[]).map(mapClient));
      if(!s.error) setSales((s.data||[]).map(mapSale));
      if(!cj.error) setCaja((cj.data||[]).map(mapCaja));
      if(!lc.error) setLocales((lc.data||[]).map(mapLocale));
    }catch(e){notify("Error cargando datos","err");}
  },[]);

  const loadFirst=useCallback(async()=>{
    setLoading(true);await loadAll();setLoading(false);
  },[loadAll]);

  useEffect(()=>{
    if(!session) return;
    loadFirst();
    const ch=sb.channel("gp_rt")
      .on("postgres_changes",{event:"*",schema:"public",table:"gp_products"},()=>loadAll())
      .on("postgres_changes",{event:"*",schema:"public",table:"gp_stock"},()=>loadAll())
      .on("postgres_changes",{event:"*",schema:"public",table:"gp_clients"},()=>loadAll())
      .on("postgres_changes",{event:"*",schema:"public",table:"gp_sales"},()=>loadAll())
      .on("postgres_changes",{event:"*",schema:"public",table:"gp_caja"},()=>loadAll())
      .on("postgres_changes",{event:"*",schema:"public",table:"gp_users"},()=>loadAll())
      .on("postgres_changes",{event:"*",schema:"public",table:"gp_locales"},()=>loadAll())
      .subscribe();
    return()=>{sb.removeChannel(ch);};
  },[session,loadFirst,loadAll]);

  const handleLogin=(u:any)=>{setSession(u);try{sessionStorage.setItem("gp_sess",JSON.stringify(u));}catch{}};
  const handleLogout=()=>{setSession(null);try{sessionStorage.removeItem("gp_sess");}catch{};setView("dash");};

  const localeNames=locales.length>0?locales.map((l:any)=>l.name):["Centro","Norte","Sur"];
  const getStk=(pid:number,loc:string)=>{const s=stock.find(s=>s.productId===pid&&s.localName===loc);return s?s.stk:0;};
  const prodsWithStk=prods.map(p=>({...p,stk:isAdmin?p.stk:getStk(p.id,session?.local||"")}));

  if(!session) return(
    <div style={{fontFamily:"'Outfit','Trebuchet MS',sans-serif"}}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;800;900&display=swap" rel="stylesheet"/>
      <Login onLogin={handleLogin}/>
    </div>
  );

  const nav=[
    {v:"dash",   icon:"db",   label:"Dashboard"},
    {v:"sale",   icon:"cart", label:"Nueva Venta"},
    {v:"history",icon:"hist", label:"Ventas"},
    {v:"clients",icon:"users",label:"Clientes"},
    {v:"caja",   icon:"cash", label:"Cierre Caja"},
    ...(isAdmin?[
      {v:"prods",   icon:"box", label:"Productos"},
      {v:"stockmgt",icon:"stk", label:"Stock x Local"},
      {v:"localmgt",icon:"loc", label:"Locales"},
      {v:"reporte", icon:"rpt", label:"Reportes"},
      {v:"usermgt", icon:"shld",label:"Usuarios"},
      {v:"perfil",  icon:"pfil",label:"Mi Perfil"},
    ]:[]),
  ];

  return(
    <div style={{fontFamily:"'Outfit','Trebuchet MS',sans-serif",background:"#030810",minHeight:"100vh",color:"#bdd0e0"}}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;800;900&display=swap" rel="stylesheet"/>
      <style>{`
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-track{background:#030810}
        ::-webkit-scrollbar-thumb{background:#192a38;border-radius:2px}
        @keyframes fu{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes ti{from{opacity:0;transform:translateX(60px)}to{opacity:1;transform:translateX(0)}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        .fade{animation:fu .22s ease}
        table{width:100%;border-collapse:collapse}
        th{font-size:8px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;color:#2a3d50;padding:10px 14px;border-bottom:1px solid #192a38;text-align:left;background:#040c16;position:sticky;top:0;z-index:1}
        td{padding:11px 14px;font-size:12px;border-bottom:1px solid #192a3814;color:#6a8090;vertical-align:middle}
        tr:hover td{background:#06111e}
        tr:last-child td{border-bottom:none}
        input[type=number]::-webkit-inner-spin-button{opacity:.4}
        @media print{
          body{background:#fff !important;color:#000 !important}
          .no-print,.sidebar-nav{display:none !important}
          .print-receipt{display:block !important;background:#fff;color:#000;font-family:monospace;padding:12px;max-width:320px;margin:0 auto}
          .print-receipt *{color:#000 !important;background:transparent !important}
        }
        .print-receipt{display:none}
      `}</style>
      {toast&&(
        <div style={{position:"fixed",top:18,right:18,zIndex:9999,animation:"ti .3s ease",background:toast.t==="err"?"#110305":"#021408",border:`1px solid ${toast.t==="err"?"#ff3333":"#008833"}`,borderRadius:8,padding:"10px 15px",fontSize:12,color:toast.t==="err"?"#ff8888":"#00cc55",boxShadow:"0 8px 32px rgba(0,0,0,.7)",display:"flex",alignItems:"center",gap:8,maxWidth:320}}>
          <Ic n={toast.t==="err"?"x":"ok"} s={13}/> {toast.msg}
        </div>
      )}
      <div style={{display:"flex",height:"100vh",overflow:"hidden"}}>
        <aside className="sidebar-nav" style={{width:192,background:"#060f1a",borderRight:"1px solid #192a38",display:"flex",flexDirection:"column",flexShrink:0}}>
          <div style={{padding:"16px 14px",borderBottom:"1px solid #192a38"}}>
            <div style={{display:"flex",alignItems:"center",gap:9}}>
              <div style={{fontSize:22}}>🐾</div>
              <div>
                <div style={{fontSize:14,fontWeight:800,color:"#bdd0e0",letterSpacing:-0.5}}>GranelPro</div>
                <div style={{display:"flex",alignItems:"center",gap:5,marginTop:2}}>
                  <div style={{width:6,height:6,borderRadius:"50%",background:online?"#00cc55":"#ff4444"}}/>
                  <span style={{fontSize:8,color:online?"#00cc55":"#ff4444",letterSpacing:1}}>{online?"EN LÍNEA":"SIN CONEXIÓN"}</span>
                </div>
              </div>
            </div>
          </div>
          <div style={{padding:"9px 13px",borderBottom:"1px solid #192a38",background:"#040c16"}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:26,height:26,borderRadius:"50%",background:isAdmin?"#110310":"#021210",border:`1px solid ${isAdmin?"#cc44ff33":"#00883333"}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <Ic n={isAdmin?"shld":"usr"} s={12} c={isAdmin?"#cc44ff":"#00cc55"}/>
              </div>
              <div style={{minWidth:0}}>
                <div style={{fontSize:11,fontWeight:700,color:"#bdd0e0",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{session.name}</div>
                <div style={{display:"flex",gap:4,alignItems:"center",flexWrap:"wrap"}}>
                  <Chip t={session.role}/>
                  {session.local&&<span style={{fontSize:8,color:"#00d4ff"}}>📍{session.local}</span>}
                </div>
              </div>
            </div>
          </div>
          <nav style={{flex:1,padding:"6px 0",overflow:"auto"}}>
            {nav.map(({v,icon,label})=>(
              <button key={v} onClick={()=>setView(v)} style={{display:"flex",alignItems:"center",gap:8,padding:"9px 14px",width:"100%",background:view===v?"#051626":"none",border:"none",borderLeft:`3px solid ${view===v?"#00d4ff":"transparent"}`,color:view===v?"#00d4ff":"#2a3d50",cursor:"pointer",fontFamily:"inherit",fontSize:11,fontWeight:600,letterSpacing:1.2,textTransform:"uppercase",transition:"all .15s"}}>
                <Ic n={icon} s={13}/>{label}
              </button>
            ))}
          </nav>
          <div style={{padding:"10px 13px",borderTop:"1px solid #192a38"}}>
            <button onClick={handleLogout} style={{display:"flex",alignItems:"center",gap:7,background:"none",border:"none",color:"#2a3d50",cursor:"pointer",fontFamily:"inherit",fontSize:10,fontWeight:600,letterSpacing:1,padding:0,width:"100%"}} onMouseEnter={(e:any)=>e.currentTarget.style.color="#bdd0e0"} onMouseLeave={(e:any)=>e.currentTarget.style.color="#2a3d50"}>
              <Ic n="out" s={12}/>Salir
            </button>
          </div>
        </aside>
        <main style={{flex:1,overflow:"auto",padding:22}}>
          {loading?(
            <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100%",flexDirection:"column",gap:14,color:"#2a3d50"}}>
              <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="#00d4ff" strokeWidth={2} strokeLinecap="round" style={{animation:"spin 1s linear infinite"}}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
              <span style={{fontSize:12}}>Conectando...</span>
            </div>
          ):<>
            {view==="dash"    &&<Dashboard prods={prodsWithStk} clients={clients} sales={sales} users={users} session={session} isAdmin={isAdmin} setView={setView} stock={stock} localeNames={localeNames}/>}
            {view==="sale"    &&<NewSale prods={prodsWithStk} clients={clients} notify={notify} session={session} stock={stock} loadAll={loadAll}/>}
            {view==="history" &&<History sales={sales} clients={clients} users={users} isAdmin={isAdmin} notify={notify} loadAll={loadAll}/>}
            {view==="clients" &&<Clients clients={clients} sales={sales} notify={notify} isAdmin={isAdmin} loadAll={loadAll}/>}
            {view==="caja"    &&<CashClose sales={sales} caja={caja} notify={notify} session={session} loadAll={loadAll}/>}
            {isAdmin&&view==="prods"    &&<Products prods={prods} notify={notify} loadAll={loadAll}/>}
            {isAdmin&&view==="stockmgt" &&<StockMgt prods={prods} stock={stock} notify={notify} loadAll={loadAll} localeNames={localeNames}/>}
            {isAdmin&&view==="localmgt" &&<LocalMgt locales={locales} notify={notify} loadAll={loadAll}/>}
            {isAdmin&&view==="reporte"  &&<Reportes sales={sales} users={users} localeNames={localeNames}/>}
            {isAdmin&&view==="usermgt"  &&<UserMgmt users={users} notify={notify} session={session} loadAll={loadAll} localeNames={localeNames}/>}
            {isAdmin&&view==="perfil"   &&<AdminProfile session={session} setSession={setSession} notify={notify} loadAll={loadAll}/>}
          </>}
        </main>
      </div>
    </div>
  );
}

function Dashboard({prods,clients,sales,users,session,isAdmin,setView,stock,localeNames}:any) {
  const td=todayStr();
  const st=sales.filter((s:any)=>s.date===td);
  const hoy=st.reduce((a:number,b:any)=>a+b.total,0);
  const mes=sales.reduce((a:number,b:any)=>a+b.total,0);
  const getCritical=()=>{
    if(isAdmin){
      const all:any[]=[];
      prods.forEach((p:any)=>{
        localeNames.forEach((loc:string)=>{
          const s=stock.find((s:any)=>s.productId===p.id&&s.localName===loc);
          const stk=s?s.stk:0;const min=s?s.min:0;
          if(stk<0) all.push({...p,stk,localName:loc,isNeg:true});
          else if(min>0&&stk<=min) all.push({...p,stk,localName:loc,isNeg:false});
        });
      });
      return all;
    } else {
      return prods.map((p:any)=>{
        const s=stock.find((s:any)=>s.productId===p.id&&s.localName===session?.local);
        const stk=s?s.stk:p.stk;const min=s?s.min:0;
        return{...p,stk,localName:session?.local,minLocal:min,isNeg:stk<0};
      }).filter((p:any)=>p.stk<0||(p.minLocal>0&&p.stk<=p.minLocal));
    }
  };
  const critical=getCritical();
  return(
    <div className="fade">
      <div style={{marginBottom:20}}>
        <h1 style={{fontSize:20,fontWeight:800,margin:0}}>Dashboard 🐾</h1>
        <p style={{color:"#2a3d50",fontSize:9,margin:"4px 0 0",letterSpacing:2.5}}>{new Date().toLocaleDateString("es-AR",{weekday:"long",year:"numeric",month:"long",day:"numeric"}).toUpperCase()}{!isAdmin&&session?.local&&<span style={{marginLeft:8,color:"#00d4ff"}}>· LOCAL {session.local.toUpperCase()}</span>}</p>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:16}}>
        <Stat label="Ventas Hoy" value={`$${hoy.toFixed(0)}`} sub={`${st.length} operaciones`} color="#00cc55" icon="trend"/>
        {isAdmin&&<Stat label="Total Mes" value={`$${mes.toFixed(0)}`} sub={`${sales.length} ventas`} color="#00d4ff" icon="hist"/>}
        <Stat label="Stock Bajo" value={critical.filter((p:any)=>!p.isNeg).length} sub={isAdmin?"todos los locales":"tu local"} color="#ff9900" icon="warn"/>
        <Stat label="Stock Negativo" value={critical.filter((p:any)=>p.isNeg).length} sub="por debajo de 0" color={critical.filter((p:any)=>p.isNeg).length>0?"#ff4444":"#00cc55"} icon="warn"/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1.8fr 1fr",gap:14,marginBottom:14}}>
        <Card sx={{overflow:"hidden"}}>
          <div style={{padding:"11px 16px",borderBottom:"1px solid #192a38",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:8,fontWeight:700,letterSpacing:2.5,color:"#2a3d50",textTransform:"uppercase"}}>Últimas Ventas</span>
            <Btn v="gh" sx={{padding:"3px 8px",fontSize:9}} onClick={()=>setView("history")}>Ver todas →</Btn>
          </div>
          <table><thead><tr><th>Cliente</th><th>Total</th><th>Pago</th><th>Pts</th><th>Vendedor</th></tr></thead>
            <tbody>{sales.slice(0,8).map((s:any)=>{const cl=clients.find((c:any)=>c.id===s.cid);const us=users.find((u:any)=>u.id===s.uid);return(<tr key={s.id}><td style={{fontWeight:700,color:"#a0bcd0"}}>{cl?.name||"—"}</td><td style={{color:"#00cc55",fontWeight:800}}>${s.total.toFixed(2)}</td><td><Chip t={s.pay}/></td><td style={{color:"#ff9900"}}>{s.ptsE>0?`+${s.ptsE}`:"-"}</td><td style={{color:"#2a3d50",fontSize:11}}>{us?.name||"—"}</td></tr>);})}</tbody>
          </table>
        </Card>
        <Card sx={{overflow:"hidden"}}>
          <div style={{padding:"11px 16px",borderBottom:"1px solid #192a38"}}><span style={{fontSize:8,fontWeight:700,letterSpacing:2.5,color:"#2a3d50",textTransform:"uppercase"}}>⚠ Stock Crítico</span></div>
          {critical.length===0?<div style={{padding:20,color:"#2a3d50",textAlign:"center",fontSize:12}}>✓ Todo normal</div>
            :critical.slice(0,8).map((p:any,i:number)=>{const[,,,em]=CAT_STYLE[p.cat]||["","","#fff",""];return(
              <div key={i} style={{padding:"7px 15px",borderBottom:"1px solid #192a3810",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div><div style={{fontSize:11,fontWeight:700,color:"#a0bcd0"}}>{em} {p.name}</div><div style={{fontSize:9,color:"#2a3d50"}}>{p.cat}{isAdmin&&p.localName?` · ${p.localName}`:""}</div></div>
                <div style={{textAlign:"right"}}><div style={{fontWeight:800,fontSize:12,color:p.isNeg?"#ff4444":"#ff9900"}}>{p.unit==="kg"?fmtW(p.stk):`${p.stk} u`}{p.isNeg?" ⚠":""}</div></div>
              </div>
            );})}
        </Card>
      </div>
      <Card sx={{overflow:"hidden"}}>
        <div style={{padding:"11px 16px",borderBottom:"1px solid #192a38"}}><span style={{fontSize:8,fontWeight:700,letterSpacing:2.5,color:"#2a3d50",textTransform:"uppercase"}}>🏆 Ranking por Puntos</span></div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)"}}>
          {[...clients].sort((a:any,b:any)=>b.pts-a.pts).slice(0,4).map((c:any,i:number)=>(
            <div key={c.id} style={{padding:"13px 15px",borderRight:"1px solid #192a3810"}}>
              <div style={{fontSize:8,color:"#2a3d50",marginBottom:3}}>#{i+1}</div>
              <div style={{fontSize:11,fontWeight:700,color:"#a0bcd0",marginBottom:4}}>{c.name}</div>
              <div style={{display:"flex",alignItems:"center",gap:5}}><Ic n="star" s={13} c="#ff9900"/><span style={{fontSize:18,fontWeight:800,color:"#ff9900"}}>{c.pts}</span></div>
              <div style={{fontSize:9,color:"#2a3d50",marginTop:2}}>≡ ${(c.pts*POINT_VALUE).toFixed(2)}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function NewSale({prods,clients,notify,session,stock,loadAll}:any) {
  const[cart,setCart]=useState<any[]>([]);
  const[cid,setCid]=useState("");
  const[pay,setPay]=useState("efectivo");
  const[date,setDate]=useState(todayStr());
  const[usePts,setUsePts]=useState(false);
  const[ptsIn,setPtsIn]=useState(0);
  const[q,setQ]=useState("");
  const[cliQ,setCliQ]=useState("");
  const[catF,setCatF]=useState("Todas");
  const[receipt,setReceipt]=useState<any>(null);
  const[showCliList,setShowCliList]=useState(false);
  const[saving,setSaving]=useState(false);
  const[expandedId,setExpandedId]=useState<number|null>(null);

  const client=clients.find((c:any)=>c.id===parseInt(cid));
  const filteredClients=clients.filter((c:any)=>c.active&&(c.name.toLowerCase().includes(cliQ.toLowerCase())||(c.dni&&c.dni.replace(/\D/g,"").includes(cliQ.replace(/\D/g,"")))));
  const visible=prods.filter((p:any)=>{
    const matchQ=q===""||p.name.toLowerCase().includes(q.toLowerCase())||(p.code&&p.code.toLowerCase().includes(q.toLowerCase()));
    const matchCat=catF==="Todas"||p.cat===catF;
    return matchQ&&matchCat;
  });
  const sub=cart.reduce((a:number,b:any)=>a+b.sub,0);
  const ptsUs=usePts?Math.min(parseInt(String(ptsIn))||0,client?.pts||0):0;
  const disc=Math.min(ptsUs*POINT_VALUE,sub*MAX_DISC_PCT);
  const total=Math.max(0,sub-disc);
  const ptsMultiplier=pay==="efectivo"?2:1;
  const ptsE=Math.floor(total/POINTS_DENOM)*ptsMultiplier;

  const selectClient=(c:any)=>{setCid(String(c.id));setCliQ(c.name);setShowCliList(false);setUsePts(false);setPtsIn(0);};

  const addToCart=(prod:any,type:string,inputValue:any)=>{
    const val=parseFloat(inputValue);
    if(!val||val<=0){notify("Ingresá un valor válido","err");return;}
    let qty:number,unitDisplay:string,sub_val:number;
    if(type==="granel"&&prod.unit==="kg"){qty=val/prod.pricePerKg;sub_val=val;unitDisplay=fmtW(qty);}
    else if(type==="granel_kg"&&prod.unit==="kg"){qty=val;sub_val=val*prod.pricePerKg;unitDisplay=fmtW(qty);type="granel";}
    else if(type==="bulto"&&prod.unit==="kg"){qty=Math.round(val)*prod.bulkWeight;sub_val=Math.round(val)*prod.bulkPrice;unitDisplay=`${Math.round(val)} bulto${Math.round(val)>1?"s":""} (${fmtW(qty)})`;}
    else{qty=Math.round(val);sub_val=qty*(prod.unitPrice||0);unitDisplay=`${qty} u`;}
    const key=`${prod.id}-${type}`;
    setCart((prev:any[])=>{
      const ex=prev.find(i=>i.key===key);
      if(ex) return prev.map(i=>i.key===key?{...i,qty:i.qty+qty,sub:i.sub+sub_val,unitDisplay:type==="granel"&&prod.unit==="kg"?fmtW(i.qty+qty):unitDisplay}:i);
      return[...prev,{key,pid:prod.id,name:prod.name,unit:prod.unit,type,qty,sub:sub_val,unitDisplay}];
    });
  };

  const confirm=async()=>{
    if(!cid){notify("Seleccioná un cliente","err");return;}
    if(!cart.length){notify("Carrito vacío","err");return;}
    setSaving(true);
    try{
      const saleId=Date.now();
      const cartSnapshot=[...cart];
      const clientSnapshot={...client};
      await sb.from("gp_sales").insert([{id:saleId,date,cid:parseInt(cid),items:cartSnapshot,sub,disc,total,pay,pts_e:ptsE,pts_s:ptsUs,uid:session.id,local_name:session.local||""}]);
      for(const it of cartSnapshot){
        const prod=prods.find((p:any)=>p.id===it.pid);
        if(!prod) continue;
        const delta=prod.unit==="kg"?it.qty:(it.type==="bulto"?it.qty/prod.bulkWeight:it.qty);
        const localName=session.local||"";
        const stkRow=stock.find((s:any)=>s.productId===it.pid&&s.localName===localName);
        if(stkRow) await sb.from("gp_stock").update({stk:stkRow.stk-delta}).eq("id",stkRow.id);
        else await sb.from("gp_stock").insert([{product_id:it.pid,local_name:localName,stk:-delta}]);
      }
      if(clientSnapshot) await sb.from("gp_clients").update({pts:clientSnapshot.pts-ptsUs+ptsE}).eq("id",clientSnapshot.id);
      const receiptData={sale:{id:saleId,date,pay,total,disc,items:cartSnapshot},clientName:clientSnapshot?.name,ptsE,ptsUs,local:session.local};
      setCart([]);setCid("");setCliQ("");setUsePts(false);setPtsIn(0);
      setSaving(false);setReceipt(receiptData);loadAll();
    }catch(e){notify("Error al guardar venta","err");setSaving(false);}
  };

  const printReceipt=()=>{
    const el=document.getElementById("receipt-print") as any;
    if(el){el.style.display="block";window.print();setTimeout(()=>{el.style.display="none";},800);}
  };

  if(receipt) return(
    <div className="fade" style={{maxWidth:440,margin:"32px auto"}}>
      <div className="print-receipt" id="receipt-print">
        <div style={{textAlign:"center",borderBottom:"1px dashed #000",paddingBottom:8,marginBottom:8}}>
          <div style={{fontSize:16,fontWeight:700}}>🐾 GranelPro Pet Shop</div>
          <div style={{fontSize:11}}>RECIBO · #{String(receipt.sale.id).slice(-6)}</div>
          <div style={{fontSize:10}}>{receipt.sale.date}{receipt.local&&` · ${receipt.local}`}</div>
        </div>
        <div style={{fontSize:11,marginBottom:4}}>Cliente: {receipt.clientName}</div>
        {receipt.sale.items.map((it:any,i:number)=>(<div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}><span>{it.name} ({it.unitDisplay})</span><span>${it.sub.toFixed(2)}</span></div>))}
        {receipt.sale.disc>0&&<div style={{display:"flex",justifyContent:"space-between",fontSize:11}}><span>Desc.</span><span>-${receipt.sale.disc.toFixed(2)}</span></div>}
        <div style={{borderTop:"1px dashed #000",paddingTop:6,display:"flex",justifyContent:"space-between",fontWeight:700,fontSize:13}}><span>TOTAL</span><span>${receipt.sale.total.toFixed(2)}</span></div>
        <div style={{textAlign:"center",marginTop:8,fontSize:10}}>¡Gracias por su compra!</div>
      </div>
      <Card sx={{padding:28,textAlign:"center"}}>
        <div style={{fontSize:44,marginBottom:12}}>✅</div>
        <div style={{fontSize:18,fontWeight:800,color:"#bdd0e0",marginBottom:4}}>¡Venta Cobrada!</div>
        <div style={{fontSize:12,color:"#2a3d50",marginBottom:18,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>{receipt.clientName} <Chip t={receipt.sale.pay}/></div>
        <div style={{background:"#040c16",borderRadius:9,padding:"14px 16px",marginBottom:14,textAlign:"left"}}>
          {receipt.sale.items.map((it:any,i:number)=>(<div key={i} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid #192a3818",fontSize:12}}><div><span style={{color:"#6a8090"}}>{it.name}</span><div style={{fontSize:9,color:"#2a3d50"}}>{it.unitDisplay}</div></div><span style={{color:"#00cc55",fontWeight:700}}>${it.sub.toFixed(2)}</span></div>))}
          {receipt.sale.disc>0&&<div style={{display:"flex",justifyContent:"space-between",padding:"5px 0",fontSize:12,color:"#ff9900"}}><span>Desc. puntos</span><span>−${receipt.sale.disc.toFixed(2)}</span></div>}
          <div style={{display:"flex",justifyContent:"space-between",paddingTop:10,fontWeight:800,fontSize:15,borderTop:"1px solid #192a38"}}><span style={{color:"#bdd0e0"}}>TOTAL</span><span style={{color:"#00cc55"}}>${receipt.sale.total.toFixed(2)}</span></div>
        </div>
        {receipt.ptsE>0&&<div style={{fontSize:11,color:"#ff9900",marginBottom:16,display:"flex",alignItems:"center",gap:6,justifyContent:"center"}}><Ic n="star" s={13} c="#ff9900"/>+{receipt.ptsE} pts acreditados{receipt.sale.pay==="efectivo"&&<span style={{background:"#140800",border:"1px solid #ff990033",borderRadius:4,padding:"1px 6px",fontSize:9,color:"#ff9900"}}>★x2 EFECTIVO</span>}</div>}
        <div style={{display:"flex",gap:9}}>
          <Btn v="cy" sx={{flex:1,justifyContent:"center",fontSize:12}} onClick={printReceipt}><Ic n="prt" s={14}/>Imprimir Recibo</Btn>
          <Btn v="g" sx={{flex:1,justifyContent:"center",fontSize:12}} onClick={()=>setReceipt(null)}><Ic n="plus" s={14}/>Nueva Venta</Btn>
        </div>
      </Card>
    </div>
  );

  return(
    <div className="fade" style={{display:"grid",gridTemplateColumns:"1fr 310px",gap:16,height:"calc(100vh - 44px)"}}>
      <div style={{overflow:"auto"}}>
        <h1 style={{fontSize:18,fontWeight:800,margin:"0 0 14px"}}>Nueva Venta {session?.local&&<span style={{fontSize:12,color:"#00d4ff",fontWeight:400}}>· {session.local}</span>}</h1>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:9,marginBottom:10}}>
          <div style={{position:"relative"}}>
            <Lbl t="Cliente"/>
            <div style={{position:"relative"}}>
              <Inp placeholder="Buscar..." value={cliQ} onChange={(e:any)=>{setCliQ(e.target.value);setCid("");setShowCliList(true);}} onFocus={()=>setShowCliList(true)} sx={{paddingLeft:34}}/>
              <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",opacity:.35}}><Ic n="srch" s={13}/></span>
            </div>
            {showCliList&&cliQ&&filteredClients.length>0&&(
              <div style={{position:"absolute",top:"100%",left:0,right:0,background:"#060f1a",border:"1px solid #192a38",borderRadius:7,zIndex:100,maxHeight:200,overflowY:"auto",boxShadow:"0 12px 32px rgba(0,0,0,.7)"}}>
                {filteredClients.map((c:any)=>(<div key={c.id} onClick={()=>selectClient(c)} style={{padding:"9px 13px",cursor:"pointer",borderBottom:"1px solid #192a3820",fontSize:12}} onMouseEnter={(e:any)=>e.currentTarget.style.background="#0b1825"} onMouseLeave={(e:any)=>e.currentTarget.style.background="transparent"}><div style={{fontWeight:700,color:"#a0bcd0"}}>{c.name}</div><div style={{fontSize:10,color:"#2a3d50"}}>DNI:{c.dni} · {c.pts}pts</div></div>))}
              </div>
            )}
            {cid&&client&&<div style={{fontSize:10,color:"#00cc55",marginTop:3}}>✓ {client.name} · {client.pts} pts</div>}
          </div>
          <div>
            <Lbl t="Pago"/>
            <Sel value={pay} onChange={(e:any)=>setPay(e.target.value)}>{PAY_OPTS.map(m=><option key={m}>{m}</option>)}</Sel>
            {pay==="efectivo"&&<div style={{fontSize:9,color:"#ff9900",marginTop:3,display:"flex",alignItems:"center",gap:4}}><Ic n="star" s={10} c="#ff9900"/>Puntos x2 por efectivo</div>}
          </div>
          <div><Lbl t="Fecha"/><Inp type="date" value={date} onChange={(e:any)=>setDate(e.target.value)}/></div>
        </div>
        <div style={{display:"flex",gap:9,marginBottom:10}}>
          <div style={{flex:1,position:"relative"}}>
            <Inp placeholder="Buscar por nombre o código..." value={q} onChange={(e:any)=>setQ(e.target.value)} sx={{paddingLeft:34}}/>
            <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",opacity:.3}}><Ic n="srch" s={13}/></span>
          </div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{["Todas",...CATEGORIES].map(c=>{const[,,tx,em]=CAT_STYLE[c]||["","","#6a8090",""];const active=catF===c;return<button key={c} onClick={()=>setCatF(c)} style={{background:active?"#0b1825":"transparent",border:`1px solid ${active?tx:"#192a38"}`,color:active?tx:"#2a3d50",borderRadius:7,padding:"6px 10px",cursor:"pointer",fontFamily:"inherit",fontSize:10,fontWeight:700,transition:"all .15s"}}>{em?`${em} ${c}`:c}</button>;})}</div>
        </div>
        <Card sx={{overflow:"hidden"}}>
          {visible.length===0&&<div style={{padding:20,color:"#2a3d50",textAlign:"center",fontSize:12}}>No hay productos</div>}
          {visible.map((p:any)=>{
            const[,,,catEm]=CAT_STYLE[p.cat]||["","","#fff",""];
            const expanded=expandedId===p.id;
            return(
              <div key={p.id} style={{borderBottom:"1px solid #192a3820"}}>
                <div onClick={()=>setExpandedId(expanded?null:p.id)} style={{display:"flex",alignItems:"center",padding:"10px 14px",cursor:"pointer",background:expanded?"#051626":"transparent",transition:"background .15s"}}
                  onMouseEnter={(e:any)=>{if(!expanded)e.currentTarget.style.background="#06111e"}}
                  onMouseLeave={(e:any)=>{if(!expanded)e.currentTarget.style.background="transparent"}}>
                  <div style={{flex:1,display:"flex",alignItems:"center",gap:10}}>
                    <div style={{fontSize:18,lineHeight:1}}>{catEm}</div>
                    <div>
                      <div style={{fontSize:12,fontWeight:700,color:"#a0bcd0"}}>{p.name}{p.code&&<span style={{marginLeft:8,fontFamily:"monospace",fontSize:10,color:"#00d4ff",fontWeight:400}}>#{p.code}</span>}</div>
                      <div style={{fontSize:9,color:"#2a3d50",marginTop:1}}>{p.cat} · {p.unit==="kg"?`$${p.pricePerKg}/kg`:`$${p.unitPrice}/u`}</div>
                    </div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <span style={{fontSize:11,fontWeight:700,color:p.stk<0?"#ff4444":p.stk<=p.min?"#ff9900":"#2a3d50"}}>{p.unit==="kg"?fmtW(p.stk):`${p.stk} u`}</span>
                    <div style={{transform:expanded?"rotate(180deg)":"rotate(0deg)",transition:"transform .2s",color:"#2a3d50"}}><Ic n="chev" s={14}/></div>
                  </div>
                </div>
                {expanded&&<div style={{padding:"10px 14px 14px",background:"#040c16",borderTop:"1px solid #192a3820"}}>
                  <ProdCardInline p={p} onAdd={(prod:any,type:string,val:any)=>{addToCart(prod,type,val);}}/>
                </div>}
              </div>
            );
          })}
        </Card>
      </div>
      <Card sx={{display:"flex",flexDirection:"column",overflow:"hidden",position:"sticky",top:0,maxHeight:"calc(100vh - 44px)"}}>
        <div style={{padding:"13px 15px",borderBottom:"1px solid #192a38",flexShrink:0}}>
          <div style={{fontSize:8,fontWeight:700,letterSpacing:2.5,color:"#2a3d50",textTransform:"uppercase",marginBottom:4}}>Carrito · {cart.length} ítems</div>
          <div style={{fontSize:24,fontWeight:800,color:"#00cc55"}}>${total.toFixed(2)}</div>
          {disc>0&&<div style={{fontSize:10,color:"#ff9900",marginTop:2}}>−${disc.toFixed(2)} desc.</div>}
        </div>
        <div style={{flex:1,overflow:"auto"}}>
          {!cart.length&&<div style={{padding:22,color:"#2a3d50",textAlign:"center",fontSize:11}}>Seleccioná productos</div>}
          {cart.map((it:any)=>(<div key={it.key} style={{padding:"8px 13px",borderBottom:"1px solid #192a3814",display:"flex",justifyContent:"space-between",alignItems:"center",gap:7}}><div style={{flex:1,minWidth:0}}><div style={{fontSize:11,fontWeight:700,color:"#a0bcd0",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{it.name}</div><div style={{display:"flex",gap:5,marginTop:2}}><Chip t={it.type}/><span style={{fontSize:9,color:"#2a3d50"}}>{it.unitDisplay}</span></div></div><div style={{display:"flex",alignItems:"center",gap:5,flexShrink:0}}><span style={{fontWeight:800,color:"#00cc55",fontSize:12}}>${it.sub.toFixed(2)}</span><button onClick={()=>setCart((p:any)=>p.filter((i:any)=>i.key!==it.key))} style={{background:"none",border:"none",color:"#ff4444",cursor:"pointer",fontSize:18,padding:0,lineHeight:1}}>×</button></div></div>))}
        </div>
        {client&&client.pts>0&&(
          <div style={{padding:"9px 13px",borderTop:"1px solid #192a38",background:"#030e06",flexShrink:0}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
              <div style={{display:"flex",alignItems:"center",gap:5}}><Ic n="star" s={12} c="#ff9900"/><span style={{fontSize:11,color:"#ff9900",fontWeight:700}}>{client.pts} pts</span></div>
              <label style={{display:"flex",alignItems:"center",gap:5,cursor:"pointer"}}><input type="checkbox" checked={usePts} onChange={(e:any)=>{setUsePts(e.target.checked);if(!e.target.checked)setPtsIn(0);}} style={{accentColor:"#ff9900"}}/><span style={{fontSize:10,color:"#6a8090"}}>Canjear</span></label>
            </div>
            {usePts&&<div style={{display:"flex",gap:7,alignItems:"center"}}><Inp type="number" min={0} max={client.pts} value={ptsIn} onChange={(e:any)=>setPtsIn(Math.min(parseInt(e.target.value)||0,client.pts))} sx={{width:72}}/><span style={{fontSize:9,color:"#2a3d50"}}>= ${(Math.min(parseInt(String(ptsIn))||0,client.pts)*POINT_VALUE).toFixed(2)}</span></div>}
          </div>
        )}
        {client&&<div style={{padding:"5px 13px",background:"#02090e",flexShrink:0,fontSize:9,color:"#2a3d50",display:"flex",justifyContent:"space-between"}}><span>Genera:</span><span style={{color:"#ff9900",fontWeight:700}}>+{ptsE} pts{pay==="efectivo"&&<span style={{color:"#ffbb00"}}> ★x2</span>}</span></div>}
        <div style={{padding:"11px 13px",borderTop:"1px solid #192a38",flexShrink:0}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:4}}><span style={{color:"#2a3d50"}}>Subtotal</span><span>${sub.toFixed(2)}</span></div>
          {disc>0&&<div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:4,color:"#ff9900"}}><span>Desc.</span><span>−${disc.toFixed(2)}</span></div>}
          <div style={{display:"flex",justifyContent:"space-between",fontWeight:800,fontSize:14,marginBottom:12}}><span style={{color:"#bdd0e0"}}>TOTAL</span><span style={{color:"#00cc55"}}>${total.toFixed(2)}</span></div>
          <Btn v="g" sx={{width:"100%",justifyContent:"center",fontSize:12}} onClick={confirm} disabled={saving}>
            {saving?<><Ic n="spin" s={13}/>Guardando...</>:<><Ic n="ok" s={13}/>Confirmar y Cobrar</>}
          </Btn>
        </div>
      </Card>
    </div>
  );
}

function ProdCardInline({p,onAdd}:any) {
  const isKg=p.unit==="kg";
  const[granelMonto,setGranelMonto]=useState(100);
  const[granelKg,setGranelKg]=useState(0.5);
  const[modoGranel,setModoGranel]=useState<"pesos"|"kg">("pesos");
  const[bultoQty,setBultoQty]=useState(1);
  const[unitQty,setUnitQty]=useState(1);
  const kgPorMonto=isKg&&p.pricePerKg>0?granelMonto/p.pricePerKg:0;
  const montoPorKg=isKg&&p.pricePerKg>0?granelKg*p.pricePerKg:0;
  const handleAddGranel=()=>{
    if(modoGranel==="pesos") onAdd(p,"granel",granelMonto);
    else onAdd(p,"granel_kg",granelKg);
  };
  return(
    <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
      {isKg&&<>
        <div style={{background:"#020e06",border:"1px solid #00882220",borderRadius:7,padding:"8px 10px",minWidth:200,flex:1}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:6,alignItems:"center"}}>
            <Chip t="granel"/><span style={{color:"#00cc55",fontWeight:700,fontSize:10}}>${p.pricePerKg.toFixed(2)}/kg</span>
          </div>
          <div style={{display:"flex",gap:4,marginBottom:7}}>
            <button onClick={()=>setModoGranel("pesos")} style={{flex:1,padding:"4px 0",borderRadius:5,border:`1px solid ${modoGranel==="pesos"?"#00cc55":"#192a38"}`,background:modoGranel==="pesos"?"#021408":"transparent",color:modoGranel==="pesos"?"#00cc55":"#2a3d50",cursor:"pointer",fontFamily:"inherit",fontSize:9,fontWeight:700,transition:"all .15s"}}>$ Pesos</button>
            <button onClick={()=>setModoGranel("kg")} style={{flex:1,padding:"4px 0",borderRadius:5,border:`1px solid ${modoGranel==="kg"?"#00d4ff":"#192a38"}`,background:modoGranel==="kg"?"#021520":"transparent",color:modoGranel==="kg"?"#00d4ff":"#2a3d50",cursor:"pointer",fontFamily:"inherit",fontSize:9,fontWeight:700,transition:"all .15s"}}>Kg</button>
          </div>
          {modoGranel==="pesos"&&<>
            <div style={{background:"#060f1a",borderRadius:5,padding:"4px 8px",marginBottom:5,fontSize:10,color:"#00cc55",fontWeight:700}}>${granelMonto} = {fmtW(kgPorMonto)}</div>
            <div style={{display:"flex",gap:5,alignItems:"center"}}>
              <Inp type="number" min="1" step="10" value={granelMonto} onChange={(e:any)=>setGranelMonto(parseFloat(e.target.value)||0)} sx={{width:70,fontSize:12}}/>
              <span style={{fontSize:9,color:"#2a3d50"}}>$</span>
              <Btn v="g" sx={{flex:1,justifyContent:"center",fontSize:9,padding:"4px 6px"}} onClick={handleAddGranel}>+ Ag.</Btn>
            </div>
          </>}
          {modoGranel==="kg"&&<>
            <div style={{background:"#060f1a",borderRadius:5,padding:"4px 8px",marginBottom:5,fontSize:10,color:"#00d4ff",fontWeight:700}}>{fmtW(granelKg)} = ${montoPorKg.toFixed(2)}</div>
            <div style={{display:"flex",gap:5,alignItems:"center"}}>
              <Inp type="number" min="0.5" step="0.5" value={granelKg} onChange={(e:any)=>setGranelKg(parseFloat(e.target.value)||0.5)} sx={{width:70,fontSize:12}}/>
              <span style={{fontSize:9,color:"#2a3d50"}}>kg</span>
              <Btn v="cy" sx={{flex:1,justifyContent:"center",fontSize:9,padding:"4px 6px"}} onClick={handleAddGranel}>+ Ag.</Btn>
            </div>
          </>}
        </div>
        {p.bulkWeight>0&&<div style={{background:"#02060e",border:"1px solid #2266ee20",borderRadius:7,padding:"8px 10px",minWidth:180,flex:1}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:4,alignItems:"center"}}><Chip t="bulto"/><span style={{color:"#3388ff",fontWeight:700,fontSize:10}}>${p.bulkPrice} · {fmtW(p.bulkWeight)}</span></div>
          <div style={{display:"flex",gap:5,alignItems:"center"}}><input type="number" min="1" value={bultoQty} onChange={(e:any)=>setBultoQty(e.target.value)} style={{width:52,background:"#030810",border:"1px solid #192a38",color:"#bdd0e0",padding:"4px 7px",borderRadius:5,fontFamily:"inherit",fontSize:11,outline:"none"}}/><span style={{fontSize:9,color:"#2a3d50"}}>bultos</span><Btn v="b" sx={{flex:1,justifyContent:"center",fontSize:9,padding:"4px 6px"}} onClick={()=>onAdd(p,"bulto",parseInt(String(bultoQty))||1)}>+ Ag.</Btn></div>
        </div>}
      </>}
      {!isKg&&<div style={{background:"#080310",border:"1px solid #aa44ff20",borderRadius:7,padding:"8px 10px",minWidth:180,flex:1}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:4,alignItems:"center"}}><Chip t="unidad"/><span style={{color:"#cc44ff",fontWeight:700,fontSize:10}}>${(p.unitPrice||0).toFixed(2)}/u</span></div>
        <div style={{display:"flex",gap:5,alignItems:"center"}}><input type="number" min="1" value={unitQty} onChange={(e:any)=>setUnitQty(e.target.value)} style={{width:52,background:"#030810",border:"1px solid #192a38",color:"#bdd0e0",padding:"4px 7px",borderRadius:5,fontFamily:"inherit",fontSize:11,outline:"none"}}/><span style={{fontSize:9,color:"#2a3d50"}}>u</span><Btn v="pu" sx={{flex:1,justifyContent:"center",fontSize:9,padding:"4px 6px"}} onClick={()=>onAdd(p,"unidad",parseInt(String(unitQty))||1)}>+ Ag.</Btn></div>
      </div>}
    </div>
  );
}

function History({sales,clients,users,isAdmin,notify,loadAll}:any) {
  const[q,setQ]=useState("");const[pf,setPf]=useState("todos");const[det,setDet]=useState<any>(null);const[confirmDel,setConfirmDel]=useState<any>(null);
  const vis=sales.filter((s:any)=>{const cl=clients.find((c:any)=>c.id===s.cid);return(!q||cl?.name.toLowerCase().includes(q.toLowerCase()))&&(pf==="todos"||s.pay===pf);});
  const delSale=async(id:any)=>{await sb.from("gp_sales").delete().eq("id",id);notify("Venta eliminada");setConfirmDel(null);loadAll();};
  return(
    <div className="fade">
      <div style={{marginBottom:16}}><h1 style={{fontSize:18,fontWeight:800,margin:0}}>Ventas</h1><p style={{color:"#2a3d50",fontSize:9,margin:"3px 0 0",letterSpacing:2.5}}>{sales.length} REGISTROS</p></div>
      <div style={{display:"flex",gap:9,marginBottom:12}}>
        <div style={{flex:1,position:"relative"}}><Inp placeholder="Buscar cliente..." value={q} onChange={(e:any)=>setQ(e.target.value)} sx={{paddingLeft:34}}/><span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",opacity:.3}}><Ic n="srch" s={13}/></span></div>
        <Sel value={pf} onChange={(e:any)=>setPf(e.target.value)} sx={{width:160}}><option value="todos">Todos</option>{PAY_OPTS.map(m=><option key={m}>{m}</option>)}</Sel>
      </div>
      <Card sx={{overflow:"hidden"}}><table><thead><tr><th>#</th><th>Fecha</th><th>Cliente</th><th>Total</th><th>Pago</th><th>Pts</th><th>Vendedor</th><th>Local</th><th></th></tr></thead>
        <tbody>{vis.map((s:any)=>{const cl=clients.find((c:any)=>c.id===s.cid);const us=users.find((u:any)=>u.id===s.uid);return(<tr key={s.id}><td style={{color:"#2a3d50",fontSize:9,fontFamily:"monospace"}}>#{String(s.id).slice(-6)}</td><td style={{color:"#2a3d50"}}>{s.date}</td><td style={{fontWeight:700,color:"#a0bcd0"}}>{cl?.name||"—"}</td><td style={{fontWeight:800,color:"#00cc55",fontSize:13}}>${s.total.toFixed(2)}</td><td><Chip t={s.pay}/></td><td style={{color:"#ff9900",fontWeight:700}}>{s.ptsE>0?`+${s.ptsE}`:"-"}</td><td style={{color:"#2a3d50",fontSize:11}}>{us?.name||"—"}</td><td style={{color:"#00d4ff",fontSize:11}}>{s.localName||"—"}</td>
          <td><div style={{display:"flex",gap:4}}>
            <Btn v="gh" sx={{padding:"3px 6px",fontSize:9}} onClick={()=>setDet(s)}><Ic n="eye" s={11}/></Btn>
            {isAdmin&&<Btn v="r" sx={{padding:"3px 6px",fontSize:9}} onClick={()=>setConfirmDel(s)}><Ic n="del" s={11}/></Btn>}
          </div></td>
        </tr>);})}</tbody>
      </table></Card>
      {det&&(<Modal close={()=>setDet(null)} w={440}><div style={{padding:22}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:14}}><h2 style={{margin:0,fontSize:15,fontWeight:800}}>Detalle #{String(det.id).slice(-6)}</h2><Btn v="gh" sx={{padding:"3px 8px"}} onClick={()=>setDet(null)}><Ic n="x" s={13}/></Btn></div>
        <div style={{fontSize:10,color:"#2a3d50",marginBottom:12}}>{det.date} · <Chip t={det.pay}/> {det.localName&&<span style={{color:"#00d4ff",marginLeft:6}}>📍{det.localName}</span>}</div>
        {det.items?.map((it:any,i:number)=>(<div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid #192a3818",alignItems:"center"}}><div><div style={{fontSize:12,color:"#a0bcd0",fontWeight:600}}>{it.name}</div><div style={{fontSize:9,color:"#2a3d50"}}>{it.unitDisplay}</div></div><span style={{color:"#00cc55",fontWeight:700}}>${it.sub?.toFixed(2)}</span></div>))}
        <div style={{background:"#040c16",borderRadius:8,padding:"11px 13px",marginTop:11}}>{det.disc>0&&<div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:4,color:"#ff9900"}}><span>Desc.</span><span>−${det.disc?.toFixed(2)}</span></div>}<div style={{display:"flex",justifyContent:"space-between",fontWeight:800,fontSize:14}}><span style={{color:"#bdd0e0"}}>TOTAL</span><span style={{color:"#00cc55"}}>${det.total.toFixed(2)}</span></div></div>
      </div></Modal>)}
      {confirmDel&&(<Modal close={()=>setConfirmDel(null)} w={380}><div style={{padding:24,textAlign:"center"}}><div style={{fontSize:36,marginBottom:12}}>🗑️</div><h2 style={{margin:"0 0 8px",fontSize:16,fontWeight:800}}>¿Eliminar venta?</h2><p style={{color:"#6a8090",fontSize:13,marginBottom:8}}>Venta <strong style={{color:"#a0bcd0"}}>#{String(confirmDel.id).slice(-6)}</strong></p><p style={{color:"#ff9900",fontSize:11,marginBottom:20}}>⚠ El stock no se repondrá automáticamente</p><div style={{display:"flex",gap:10,justifyContent:"center"}}><Btn v="gh" onClick={()=>setConfirmDel(null)}>Cancelar</Btn><Btn v="r" onClick={()=>delSale(confirmDel.id)}><Ic n="del" s={13}/>Eliminar</Btn></div></div></Modal>)}
    </div>
  );
}

function Reportes({sales,users,localeNames}:any) {
  const[tab,setTab]=useState<"local"|"user">("local");
  const byLocal=localeNames.map((l:string)=>{const ls=sales.filter((s:any)=>s.localName===l);return{name:l,count:ls.length,total:ls.reduce((a:number,b:any)=>a+b.total,0)};});
  const byUser=users.map((u:any)=>{const us=sales.filter((s:any)=>s.uid===u.id);return{name:u.name,local:u.local,role:u.role,count:us.length,total:us.reduce((a:number,b:any)=>a+b.total,0)};}).filter((u:any)=>u.count>0).sort((a:any,b:any)=>b.total-a.total);
  const totalGeneral=sales.reduce((a:number,b:any)=>a+b.total,0);
  return(
    <div className="fade">
      <div style={{marginBottom:16}}><h1 style={{fontSize:18,fontWeight:800,margin:0}}>Reportes</h1><p style={{color:"#2a3d50",fontSize:9,margin:"3px 0 0",letterSpacing:2.5}}>VENTAS TOTALES · {sales.length} OPERACIONES</p></div>
      <Card sx={{padding:"14px 16px",marginBottom:16,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div><div style={{fontSize:9,color:"#2a3d50",letterSpacing:2,textTransform:"uppercase",marginBottom:4}}>Total General</div><div style={{fontSize:28,fontWeight:800,color:"#00cc55"}}>${totalGeneral.toFixed(2)}</div></div>
        <div style={{display:"flex",gap:8}}>
          <Btn v={tab==="local"?"cy":"gh"} onClick={()=>setTab("local")}><Ic n="loc" s={13}/>Por Local</Btn>
          <Btn v={tab==="user"?"cy":"gh"} onClick={()=>setTab("user")}><Ic n="usr" s={13}/>Por Usuario</Btn>
        </div>
      </Card>
      {tab==="local"&&(<Card sx={{overflow:"hidden"}}><div style={{padding:"11px 16px",borderBottom:"1px solid #192a38"}}><span style={{fontSize:8,fontWeight:700,letterSpacing:2.5,color:"#2a3d50",textTransform:"uppercase"}}>Ventas por Local</span></div>
        <table><thead><tr><th>Local</th><th>Ventas</th><th>Total</th><th>% del Total</th></tr></thead>
          <tbody>{byLocal.sort((a:any,b:any)=>b.total-a.total).map((l:any)=>(<tr key={l.name}><td style={{fontWeight:700,color:"#a0bcd0"}}>📍 {l.name}</td><td>{l.count}</td><td style={{fontWeight:800,color:"#00cc55",fontSize:13}}>${l.total.toFixed(2)}</td><td><div style={{display:"flex",alignItems:"center",gap:8}}><div style={{flex:1,height:6,background:"#192a38",borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",background:"#00cc55",width:`${totalGeneral>0?(l.total/totalGeneral*100):0}%`,borderRadius:3}}/></div><span style={{fontSize:10,color:"#2a3d50",minWidth:36}}>{totalGeneral>0?(l.total/totalGeneral*100).toFixed(1):0}%</span></div></td></tr>))}</tbody>
        </table>
      </Card>)}
      {tab==="user"&&(<Card sx={{overflow:"hidden"}}><div style={{padding:"11px 16px",borderBottom:"1px solid #192a38"}}><span style={{fontSize:8,fontWeight:700,letterSpacing:2.5,color:"#2a3d50",textTransform:"uppercase"}}>Ventas por Usuario</span></div>
        <table><thead><tr><th>Usuario</th><th>Rol</th><th>Local</th><th>Ventas</th><th>Total</th><th>% del Total</th></tr></thead>
          <tbody>{byUser.map((u:any,i:number)=>(<tr key={i}><td style={{fontWeight:700,color:"#a0bcd0"}}>{u.name}</td><td><Chip t={u.role}/></td><td style={{color:"#00d4ff"}}>{u.local||"—"}</td><td>{u.count}</td><td style={{fontWeight:800,color:"#00cc55",fontSize:13}}>${u.total.toFixed(2)}</td><td><div style={{display:"flex",alignItems:"center",gap:8}}><div style={{flex:1,height:6,background:"#192a38",borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",background:"#3388ff",width:`${totalGeneral>0?(u.total/totalGeneral*100):0}%`,borderRadius:3}}/></div><span style={{fontSize:10,color:"#2a3d50",minWidth:36}}>{totalGeneral>0?(u.total/totalGeneral*100).toFixed(1):0}%</span></div></td></tr>))}</tbody>
        </table>
      </Card>)}
    </div>
  );
}

function StockMgt({prods,stock,notify,loadAll,localeNames}:any) {
  const[localF,setLocalF]=useState(localeNames[0]||"");
  const[saving,setSaving]=useState<number|null>(null);
  const[vals,setVals]=useState<Record<number,string>>({});
  const[q,setQ]=useState("");
  const[catF,setCatF]=useState("Todas");

  useEffect(()=>{setVals({});},[localF]);

  const getStk=(pid:number)=>{
    const r=stock.find((s:any)=>s.productId===pid&&s.localName===localF);
    return r?r.stk:0;
  };

  const saveStk=async(prod:any)=>{
    const stk=getStk(prod.id);
    const inputVal=vals[prod.id]!==undefined?vals[prod.id]:String(stk);
    const newStk=parseFloat(inputVal);
    if(isNaN(newStk)){notify("Valor inválido","err");return;}
    setSaving(prod.id);
    try{
      const{data:rows,error:findErr}=await sb
        .from("gp_stock")
        .select("id")
        .eq("product_id",prod.id)
        .eq("local_name",localF)
        .limit(1);
      if(findErr){notify("Error: "+findErr.message,"err");setSaving(null);return;}
      if(rows&&rows.length>0){
        const res=await sb.from("gp_stock").update({stk:newStk}).eq("id",rows[0].id);
        if(res.error){notify("Error: "+res.error.message,"err");setSaving(null);return;}
      } else {
        const res=await sb.from("gp_stock").insert([{product_id:prod.id,local_name:localF,stk:newStk}]);
        if(res.error){notify("Error: "+res.error.message,"err");setSaving(null);return;}
      }
      notify("✓ "+prod.name+" → "+newStk);
      setVals(v=>({...v,[prod.id]:undefined as any}));
      await loadAll();
    }catch(e:any){notify("Error: "+e.message,"err");}
    setSaving(null);
  };

  const filtered=prods.filter((p:any)=>{
    const matchQ=p.name.toLowerCase().includes(q.toLowerCase())||(p.code&&p.code.toLowerCase().includes(q.toLowerCase()));
    const matchCat=catF==="Todas"||p.cat===catF;
    return matchQ&&matchCat;
  });

  return(
    <div className="fade">
      <div style={{marginBottom:16}}><h1 style={{fontSize:18,fontWeight:800,margin:0}}>Stock por Local</h1><p style={{color:"#2a3d50",fontSize:9,margin:"3px 0 0",letterSpacing:2.5}}>ADMINISTRADOR · EDICIÓN LIBRE</p></div>
      <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}>
        {localeNames.map((l:string)=>(
          <button key={l} onClick={()=>setLocalF(l)} style={{background:localF===l?"#051626":"transparent",border:`1px solid ${localF===l?"#00d4ff":"#192a38"}`,color:localF===l?"#00d4ff":"#2a3d50",borderRadius:7,padding:"7px 14px",cursor:"pointer",fontFamily:"inherit",fontSize:11,fontWeight:700,transition:"all .15s"}}>📍 {l}</button>
        ))}
      </div>
      <div style={{display:"flex",gap:9,marginBottom:12,flexWrap:"wrap"}}>
        <div style={{position:"relative",flex:1,minWidth:180}}>
          <Inp placeholder="Buscar por nombre o código..." value={q} onChange={(e:any)=>setQ(e.target.value)} sx={{paddingLeft:34}}/>
          <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",opacity:.3}}><Ic n="srch" s={13}/></span>
        </div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {["Todas",...CATEGORIES].map(c=>{
            const[,,tx,em]=CAT_STYLE[c]||["","","#6a8090",""];
            const active=catF===c;
            return(
              <button key={c} onClick={()=>setCatF(c)} style={{background:active?"#0b1825":"transparent",border:`1px solid ${active?tx:"#192a38"}`,color:active?tx:"#2a3d50",borderRadius:7,padding:"6px 10px",cursor:"pointer",fontFamily:"inherit",fontSize:11,fontWeight:700,transition:"all .15s",display:"flex",alignItems:"center",gap:4}}>
                {em&&<span style={{fontSize:14}}>{em}</span>}{c==="Todas"?c:""}
              </button>
            );
          })}
        </div>
      </div>
      <Card sx={{overflow:"hidden"}}>
        <div style={{padding:"11px 16px",borderBottom:"1px solid #192a38",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:8,fontWeight:700,letterSpacing:2.5,color:"#2a3d50",textTransform:"uppercase"}}>Stock · {localF}</span>
          <span style={{fontSize:10,color:"#00d4ff"}}>{filtered.length} productos</span>
        </div>
        <table>
          <thead><tr><th>Producto</th><th>Cat.</th><th>Tipo</th><th>Stock Actual</th><th>Nuevo Stock</th><th></th></tr></thead>
          <tbody>{filtered.map((p:any)=>{
            const stk=getStk(p.id);
            const[,,catTx,catEm]=CAT_STYLE[p.cat]||["","","#fff",""];
            const edited=vals[p.id]!==undefined;
            return(
              <tr key={p.id}>
                <td style={{fontWeight:700,color:"#a0bcd0"}}>{catEm} {p.name}{p.code&&<span style={{marginLeft:6,fontFamily:"monospace",fontSize:10,color:"#00d4ff"}}>#{p.code}</span>}</td>
                <td><span style={{fontSize:9,background:"#192a38",color:catTx,padding:"2px 7px",borderRadius:10,fontWeight:700}}>{p.cat}</span></td>
                <td><Chip t={p.unit==="kg"?"granel":"unidad"}/></td>
                <td><span style={{fontWeight:800,color:stk<0?"#ff4444":"#00cc55"}}>{p.unit==="kg"?fmtW(stk):`${stk} u`}{stk<0?" ⚠":""}</span></td>
                <td>
                  <input
                    type="number"
                    step={p.unit==="kg"?".5":"1"}
                    value={edited?vals[p.id]:stk}
                    onChange={(e:any)=>setVals(v=>({...v,[p.id]:e.target.value}))}
                    onFocus={(e:any)=>e.target.select()}
                    style={{width:100,fontSize:12,background:edited?"#021408":"#060f1a",border:`1px solid ${edited?"#00cc55":"#192a38"}`,color:"#bdd0e0",padding:"6px 8px",borderRadius:6,fontFamily:"inherit",outline:"none"}}
                  />
                </td>
                <td>
                  <Btn v="g" sx={{padding:"4px 10px",fontSize:9}} onClick={()=>saveStk(p)} disabled={saving===p.id}>
                    {saving===p.id?<><Ic n="spin" s={11}/>...</>:<><Ic n="ok" s={11}/>Guardar</>}
                  </Btn>
                </td>
              </tr>
            );
          })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function LocalMgt({locales,notify,loadAll}:any) {
  const[modal,setModal]=useState(false);const[form,setForm]=useState<any>(null);const[saving,setSaving]=useState(false);const[confirmDel,setConfirmDel]=useState<any>(null);
  const openNew=()=>{setForm({name:""});setModal(true);};
  const openEdit=(l:any)=>{setForm({...l});setModal(true);};
  const save=async()=>{
    if(!form.name.trim()){notify("Nombre requerido","err");return;}
    setSaving(true);
    try{
      if(form.id) await sb.from("gp_locales").update({name:form.name.trim()}).eq("id",form.id);
      else await sb.from("gp_locales").insert([{name:form.name.trim()}]);
      notify(form.id?"Local actualizado":"Local creado");loadAll();setModal(false);
    }catch(e){notify("Error","err");}
    setSaving(false);
  };
  const del=async(id:any)=>{await sb.from("gp_locales").delete().eq("id",id);notify("Local eliminado");setConfirmDel(null);loadAll();};
  return(
    <div className="fade">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}><div><h1 style={{fontSize:18,fontWeight:800,margin:0}}>Locales</h1><p style={{color:"#2a3d50",fontSize:9,margin:"3px 0 0",letterSpacing:2.5}}>PUNTOS DE VENTA</p></div><Btn v="g" onClick={openNew}><Ic n="plus" s={13}/>Nuevo Local</Btn></div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:12}}>
        {locales.map((l:any)=>(<Card key={l.id} sx={{padding:16,display:"flex",justifyContent:"space-between",alignItems:"center"}}><div style={{display:"flex",alignItems:"center",gap:10}}><div style={{fontSize:22}}>📍</div><div style={{fontSize:14,fontWeight:800,color:"#bdd0e0"}}>{l.name}</div></div><div style={{display:"flex",gap:5}}><Btn v="gh" sx={{padding:"3px 6px",fontSize:9}} onClick={()=>openEdit(l)}><Ic n="edit" s={11}/></Btn><Btn v="r" sx={{padding:"3px 6px",fontSize:9}} onClick={()=>setConfirmDel(l)}><Ic n="del" s={11}/></Btn></div></Card>))}
        {locales.length===0&&<div style={{color:"#2a3d50",fontSize:12,padding:20}}>No hay locales. Creá el primero.</div>}
      </div>
      {modal&&form&&(<Modal close={()=>setModal(false)} w={360}><div style={{padding:22}}><h2 style={{margin:"0 0 16px",fontSize:15,fontWeight:800}}>{form.id?"Editar":"Nuevo"} Local</h2><Lbl t="Nombre del Local"/><Inp value={form.name} onChange={(e:any)=>setForm((f:any)=>({...f,name:e.target.value}))} placeholder="ej: Sucursal Centro"/><div style={{display:"flex",gap:9,marginTop:16,justifyContent:"flex-end"}}><Btn v="gh" onClick={()=>setModal(false)}>Cancelar</Btn><Btn v="g" onClick={save} disabled={saving}>{saving?"Guardando...":"Guardar"}</Btn></div></div></Modal>)}
      {confirmDel&&(<Modal close={()=>setConfirmDel(null)} w={360}><div style={{padding:24,textAlign:"center"}}><div style={{fontSize:36,marginBottom:12}}>⚠️</div><h2 style={{margin:"0 0 8px",fontSize:16,fontWeight:800}}>¿Eliminar local?</h2><p style={{color:"#6a8090",fontSize:13,marginBottom:20}}><strong style={{color:"#a0bcd0"}}>{confirmDel.name}</strong></p><div style={{display:"flex",gap:10,justifyContent:"center"}}><Btn v="gh" onClick={()=>setConfirmDel(null)}>Cancelar</Btn><Btn v="r" onClick={()=>del(confirmDel.id)}><Ic n="del" s={13}/>Eliminar</Btn></div></div></Modal>)}
    </div>
  );
}

function Clients({clients,sales,notify,isAdmin,loadAll}:any) {
  const[modal,setModal]=useState(false);const[form,setForm]=useState<any>(null);const[det,setDet]=useState<any>(null);const[rdm,setRdm]=useState<any>(null);const[rpts,setRpts]=useState(0);const[q,setQ]=useState("");const[confirmDel,setConfirmDel]=useState<any>(null);const[saving,setSaving]=useState(false);
  const openNew=()=>{setForm({name:"",dni:"",phone:"",email:"",addr:"",pay:"efectivo",pts:0,active:true});setModal(true);};
  const openEdit=(c:any)=>{setForm({...c});setModal(true);};
  const save=async()=>{
    if(!form.name.trim()){notify("Nombre requerido","err");return;}
    setSaving(true);
    try{
      if(form.id) await sb.from("gp_clients").update({name:form.name,dni:form.dni,phone:form.phone,email:form.email,addr:form.addr,pay:form.pay,pts:form.pts,active:form.active}).eq("id",form.id);
      else await sb.from("gp_clients").insert([{name:form.name,dni:form.dni,phone:form.phone,email:form.email,addr:form.addr,pay:form.pay,pts:form.pts||0,active:form.active!==false}]);
      notify(form.id?"Actualizado":"Cliente creado");loadAll();setModal(false);
    }catch(e){notify("Error","err");}
    setSaving(false);
  };
  const del=async(id:any)=>{await sb.from("gp_clients").delete().eq("id",id);notify("Eliminado");setConfirmDel(null);loadAll();};
  const doRedeem=async()=>{
    const pts=parseInt(String(rpts))||0;
    if(pts<=0||pts>rdm.pts){notify("Puntos inválidos","err");return;}
    await sb.from("gp_clients").update({pts:rdm.pts-pts}).eq("id",rdm.id);
    notify(`${pts} pts canjeados`);setRdm(null);setRpts(0);loadAll();
  };
  const vis=clients.filter((c:any)=>c.name.toLowerCase().includes(q.toLowerCase())||(c.dni&&c.dni.toLowerCase().includes(q.toLowerCase())));
  return(
    <div className="fade">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}><div><h1 style={{fontSize:18,fontWeight:800,margin:0}}>Clientes</h1><p style={{color:"#2a3d50",fontSize:9,margin:"3px 0 0",letterSpacing:2.5}}>{clients.length} REGISTROS</p></div><Btn v="g" onClick={openNew}><Ic n="plus" s={13}/>Nuevo</Btn></div>
      <div style={{position:"relative",marginBottom:12}}><Inp placeholder="Buscar..." value={q} onChange={(e:any)=>setQ(e.target.value)} sx={{paddingLeft:34}}/><span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",opacity:.3}}><Ic n="srch" s={13}/></span></div>
      <Card sx={{overflow:"hidden"}}><table><thead><tr><th>Nombre</th><th>DNI</th><th>Teléfono</th><th>Pago</th><th>Compras</th><th>Facturado</th><th>Puntos</th><th></th></tr></thead>
        <tbody>{vis.map((c:any)=>{const cs=sales.filter((s:any)=>s.cid===c.id);const tf=cs.reduce((a:number,b:any)=>a+b.total,0);return(<tr key={c.id}><td style={{fontWeight:700,color:"#a0bcd0"}}>{c.name}</td><td style={{color:"#2a3d50",fontFamily:"monospace",fontSize:10}}>{c.dni||"—"}</td><td style={{color:"#2a3d50"}}>{c.phone||"—"}</td><td><Chip t={c.pay}/></td><td>{cs.length}</td><td style={{color:"#00cc55",fontWeight:700}}>${tf.toFixed(2)}</td><td><div style={{display:"flex",alignItems:"center",gap:4}}><Ic n="star" s={11} c="#ff9900"/><span style={{fontWeight:800,color:"#ff9900"}}>{c.pts}</span></div></td><td><div style={{display:"flex",gap:4}}><Btn v="gh" sx={{padding:"3px 6px",fontSize:9}} onClick={()=>setDet(c.id)}><Ic n="eye" s={11}/></Btn><Btn v="gh" sx={{padding:"3px 6px",fontSize:9}} onClick={()=>openEdit(c)}><Ic n="edit" s={11}/></Btn><Btn v="or" sx={{padding:"3px 6px",fontSize:9}} onClick={()=>{setRdm(c);setRpts(0);}}><Ic n="gift" s={11}/></Btn>{isAdmin&&<Btn v="r" sx={{padding:"3px 6px",fontSize:9}} onClick={()=>setConfirmDel(c)}><Ic n="del" s={11}/></Btn>}</div></td></tr>);})}</tbody>
      </table></Card>
      {modal&&form&&(<Modal close={()=>setModal(false)}><div style={{padding:22}}><h2 style={{margin:"0 0 16px",fontSize:15,fontWeight:800}}>{form.id?"Editar":"Nuevo"} Cliente</h2><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:11}}><div style={{gridColumn:"1/-1"}}><Lbl t="Nombre"/><Inp value={form.name} onChange={(e:any)=>setForm((f:any)=>({...f,name:e.target.value}))}/></div><div><Lbl t="DNI"/><Inp value={form.dni} onChange={(e:any)=>setForm((f:any)=>({...f,dni:e.target.value}))}/></div><div><Lbl t="Teléfono"/><Inp value={form.phone} onChange={(e:any)=>setForm((f:any)=>({...f,phone:e.target.value}))}/></div><div><Lbl t="Email"/><Inp value={form.email} onChange={(e:any)=>setForm((f:any)=>({...f,email:e.target.value}))}/></div><div><Lbl t="Dirección"/><Inp value={form.addr} onChange={(e:any)=>setForm((f:any)=>({...f,addr:e.target.value}))}/></div><div><Lbl t="Pago"/><Sel value={form.pay} onChange={(e:any)=>setForm((f:any)=>({...f,pay:e.target.value}))}>{PAY_OPTS.map(m=><option key={m}>{m}</option>)}</Sel></div>{form.id&&<div><Lbl t="Puntos"/><Inp type="number" value={form.pts} onChange={(e:any)=>setForm((f:any)=>({...f,pts:parseInt(e.target.value)||0}))}/></div>}<div style={{display:"flex",alignItems:"center",gap:8}}><input type="checkbox" checked={form.active!==false} onChange={(e:any)=>setForm((f:any)=>({...f,active:e.target.checked}))} style={{accentColor:"#00cc55"}}/><span style={{fontSize:12,color:"#6a8090"}}>Activo</span></div></div><div style={{display:"flex",gap:9,marginTop:16,justifyContent:"flex-end"}}><Btn v="gh" onClick={()=>setModal(false)}>Cancelar</Btn><Btn v="g" onClick={save} disabled={saving}>{saving?"Guardando...":"Guardar"}</Btn></div></div></Modal>)}
      {confirmDel&&(<Modal close={()=>setConfirmDel(null)} w={380}><div style={{padding:24,textAlign:"center"}}><div style={{fontSize:36,marginBottom:12}}>⚠️</div><h2 style={{margin:"0 0 8px",fontSize:16,fontWeight:800}}>¿Eliminar?</h2><p style={{color:"#6a8090",fontSize:13,marginBottom:20}}><strong style={{color:"#a0bcd0"}}>{confirmDel.name}</strong></p><div style={{display:"flex",gap:10,justifyContent:"center"}}><Btn v="gh" onClick={()=>setConfirmDel(null)}>Cancelar</Btn><Btn v="r" onClick={()=>del(confirmDel.id)}><Ic n="del" s={13}/>Eliminar</Btn></div></div></Modal>)}
      {det&&(()=>{const c=clients.find((x:any)=>x.id===det);const cs=sales.filter((s:any)=>s.cid===det);const tf=cs.reduce((a:number,b:any)=>a+b.total,0);return(<Modal close={()=>setDet(null)} w={460}><div style={{padding:22}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:14}}><h2 style={{margin:0,fontSize:16,fontWeight:800}}>{c?.name}</h2><Btn v="gh" sx={{padding:"3px 8px"}} onClick={()=>setDet(null)}><Ic n="x" s={13}/></Btn></div><div style={{background:"#020e06",border:"1px solid #00882220",borderRadius:9,padding:"12px 14px",marginBottom:13,display:"flex",justifyContent:"space-between"}}><div style={{display:"flex",alignItems:"center",gap:8}}><Ic n="star" s={22} c="#ff9900"/><div><div style={{fontSize:22,fontWeight:800,color:"#ff9900"}}>{c?.pts}</div><div style={{fontSize:8,color:"#2a3d50"}}>PUNTOS</div></div></div><div style={{textAlign:"right"}}><div style={{fontSize:13,color:"#00cc55",fontWeight:700}}>${tf.toFixed(2)}</div><div style={{fontSize:8,color:"#2a3d50"}}>total</div></div></div><div style={{maxHeight:200,overflowY:"auto"}}>{cs.map((s:any)=>(<div key={s.id} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid #192a3814"}}><div><div style={{fontSize:11,color:"#a0bcd0",fontWeight:600}}>{s.date}</div><Chip t={s.pay}/></div><div style={{textAlign:"right"}}><div style={{fontWeight:800,color:"#00cc55"}}>${s.total.toFixed(2)}</div></div></div>))}</div></div></Modal>);})()}
      {rdm&&(<Modal close={()=>setRdm(null)} w={340}><div style={{padding:22}}><h2 style={{margin:"0 0 14px",fontSize:15,fontWeight:800}}>Canjear — {rdm.name}</h2><div style={{background:"#020e06",border:"1px solid #ff990022",borderRadius:9,padding:14,marginBottom:14,textAlign:"center"}}><div style={{fontSize:30,fontWeight:800,color:"#ff9900"}}>{rdm.pts} pts</div><div style={{fontSize:9,color:"#2a3d50"}}>≡ ${(rdm.pts*POINT_VALUE).toFixed(2)}</div></div><div style={{marginBottom:13}}><Lbl t="Puntos a canjear"/><Inp type="number" min={0} max={rdm.pts} value={rpts} onChange={(e:any)=>setRpts(e.target.value)}/></div><div style={{display:"flex",gap:9,justifyContent:"flex-end"}}><Btn v="gh" onClick={()=>setRdm(null)}>Cancelar</Btn><Btn v="or" onClick={doRedeem}><Ic n="gift" s={13}/>Canjear</Btn></div></div></Modal>)}
    </div>
  );
}

function CashClose({sales,caja,notify,session,loadAll}:any) {
  const[closing,setClosing]=useState(false);const[openAmt,setOpenAmt]=useState("");const[notes,setNotes]=useState("");const[saving,setSaving]=useState(false);
  const closedIds=caja.flatMap((d:any)=>d.saleIds||[]);
  const unclosed=sales.filter((s:any)=>!closedIds.includes(s.id));
  const byPay=PAY_OPTS.reduce((acc:any,m)=>{acc[m]=unclosed.filter((s:any)=>s.pay===m).reduce((a:number,b:any)=>a+b.total,0);return acc;},{});
  const totalEf=byPay["efectivo"]||0;const totalDig=(byPay["tarjeta"]||0)+(byPay["QR"]||0);const totalAll=unclosed.reduce((a:number,b:any)=>a+b.total,0);
  const last=caja[caja.length-1];
  const doClose=async()=>{
    if(!unclosed.length){notify("No hay ventas sin cerrar","err");return;}
    setSaving(true);
    try{
      await sb.from("gp_caja").insert([{id:Date.now(),closed_by:session.id,closed_by_name:session.name,sale_ids:unclosed.map((s:any)=>s.id),by_pay:byPay,total_ef:totalEf,total_dig:totalDig,total_all:totalAll,opening_amount:parseFloat(openAmt)||0,notes,sales_count:unclosed.length,local_name:session.local||""}]);
      notify(`Caja cerrada. $${totalAll.toFixed(2)}`);setClosing(false);setOpenAmt("");setNotes("");loadAll();
    }catch(e){notify("Error","err");}
    setSaving(false);
  };
  return(
    <div className="fade">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}><div><h1 style={{fontSize:18,fontWeight:800,margin:0}}>Cierre de Caja</h1><p style={{color:"#2a3d50",fontSize:9,margin:"3px 0 0",letterSpacing:2.5}}>{last?`ÚLTIMO: ${new Date(last.closedAt).toLocaleString("es-AR")}`:"SIN CIERRES"}</p></div><Btn v="g" onClick={()=>setClosing(true)}><Ic n="cash" s={14}/>Cerrar Caja</Btn></div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:14}}>
        <Stat label="Sin Cerrar" value={unclosed.length} sub="ventas" color="#00d4ff" icon="hist"/>
        <Stat label="Efectivo" value={`$${totalEf.toFixed(2)}`} sub="físico" color="#00cc55" icon="cash"/>
        <Stat label="Tarjeta" value={`$${(byPay["tarjeta"]||0).toFixed(2)}`} sub="POS" color="#3388ff" icon="star"/>
        <Stat label="QR" value={`$${(byPay["QR"]||0).toFixed(2)}`} sub="digital" color="#ccdd00" icon="trend"/>
      </div>
      {caja.length>0&&<Card sx={{padding:0,overflow:"hidden"}}><div style={{padding:"11px 16px",borderBottom:"1px solid #192a38"}}><span style={{fontSize:8,fontWeight:700,letterSpacing:2.5,color:"#2a3d50",textTransform:"uppercase"}}>Historial</span></div>
        <table><thead><tr><th>Fecha</th><th>Por</th><th>Local</th><th>Ventas</th><th>Efectivo</th><th>Digital</th><th>Total</th></tr></thead>
          <tbody>{[...caja].reverse().map((d:any)=>(<tr key={d.id}><td style={{fontSize:11}}>{new Date(d.closedAt).toLocaleString("es-AR")}</td><td style={{color:"#6a8090",fontSize:11}}>{d.closedByName}</td><td style={{color:"#00d4ff",fontSize:11}}>{d.localName||"—"}</td><td>{d.salesCount}</td><td style={{color:"#00cc55",fontWeight:700}}>${(d.totalEf||0).toFixed(2)}</td><td style={{color:"#3388ff",fontWeight:700}}>${(d.totalDig||0).toFixed(2)}</td><td style={{fontWeight:800,color:"#00cc55"}}>${(d.totalAll||0).toFixed(2)}</td></tr>))}</tbody>
        </table>
      </Card>}
      {closing&&(<Modal close={()=>setClosing(false)} w={400}><div style={{padding:24}}><h2 style={{margin:"0 0 16px",fontSize:15,fontWeight:800}}>Confirmar Cierre</h2><div style={{background:"#040c16",borderRadius:9,padding:14,marginBottom:14}}>{PAY_OPTS.filter(m=>(byPay[m]||0)>0).map(m=>(<div key={m} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid #192a3818",alignItems:"center"}}><Chip t={m}/><span style={{fontWeight:700,color:"#00cc55"}}>${(byPay[m]||0).toFixed(2)}</span></div>))}<div style={{display:"flex",justifyContent:"space-between",paddingTop:10,fontWeight:800,fontSize:14,borderTop:"1px solid #192a38",marginTop:4}}><span style={{color:"#bdd0e0"}}>TOTAL</span><span style={{color:"#00cc55"}}>${totalAll.toFixed(2)}</span></div></div><div style={{marginBottom:11}}><Lbl t="Fondo apertura ($)"/><Inp type="number" step=".01" placeholder="0.00" value={openAmt} onChange={(e:any)=>setOpenAmt(e.target.value)}/></div><div style={{marginBottom:14}}><Lbl t="Notas"/><textarea value={notes} onChange={(e:any)=>setNotes(e.target.value)} style={{background:"#060f1a",border:"1px solid #192a38",color:"#bdd0e0",padding:"9px 12px",borderRadius:6,fontFamily:"inherit",fontSize:13,width:"100%",resize:"vertical",minHeight:60,outline:"none"}}/></div><div style={{display:"flex",gap:9,justifyContent:"flex-end"}}><Btn v="gh" onClick={()=>setClosing(false)}>Cancelar</Btn><Btn v="g" onClick={doClose} disabled={saving}>{saving?"Cerrando...":"Confirmar"}</Btn></div></div></Modal>)}
    </div>
  );
}

function Products({prods,notify,loadAll}:any) {
  const[modal,setModal]=useState(false);const[form,setForm]=useState<any>(null);const[q,setQ]=useState("");const[catF,setCatF]=useState("Todas");const[saving,setSaving]=useState(false);const[confirmDel,setConfirmDel]=useState<any>(null);
  const openNew=()=>{setForm({name:"",code:"",cat:"Perro",unit:"kg",pricePerKg:0,bulkWeight:25,bulkPrice:0,unitPrice:0,stk:0});setModal(true);};
  const openEdit=(p:any)=>{setForm({...p});setModal(true);};
  const save=async()=>{
    if(!form.name.trim()){notify("Nombre requerido","err");return;}
    setSaving(true);
    const payload={code:form.code||"",name:form.name,cat:form.cat,unit:form.unit,price_per_kg:form.pricePerKg||0,bulk_weight:form.bulkWeight||0,bulk_price:form.bulkPrice||0,unit_price:form.unitPrice||0,stk:form.stk||0,min_stk:0,updated_at:new Date().toISOString()};
    try{
      if(form.id) await sb.from("gp_products").update(payload).eq("id",form.id);
      else{
        const{data:newProd}=await sb.from("gp_products").insert([payload]).select().single();
        if(newProd){
          const locs=await sb.from("gp_locales").select("name");
          const locNames=locs.data?.map((l:any)=>l.name)||["Centro","Norte","Sur"];
          for(const loc of locNames) await sb.from("gp_stock").insert([{product_id:newProd.id,local_name:loc,stk:0}]);
        }
      }
      notify(form.id?"Actualizado":"Creado");loadAll();setModal(false);
    }catch(e){notify("Error","err");}
    setSaving(false);
  };
  const del=async(id:any)=>{await sb.from("gp_products").delete().eq("id",id);notify("Eliminado");setConfirmDel(null);loadAll();};
  const isKg=form?.unit==="kg";
  const vis=prods.filter((p:any)=>p.name.toLowerCase().includes(q.toLowerCase())&&(catF==="Todas"||p.cat===catF));
  return(
    <div className="fade">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}><div><h1 style={{fontSize:18,fontWeight:800,margin:0}}>Productos</h1><p style={{color:"#2a3d50",fontSize:9,margin:"3px 0 0",letterSpacing:2.5}}>{prods.length} REGISTROS</p></div><Btn v="g" onClick={openNew}><Ic n="plus" s={13}/>Nuevo</Btn></div>
      <div style={{display:"flex",gap:9,marginBottom:12}}><div style={{flex:1,position:"relative"}}><Inp placeholder="Buscar..." value={q} onChange={(e:any)=>setQ(e.target.value)} sx={{paddingLeft:34}}/><span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",opacity:.3}}><Ic n="srch" s={13}/></span></div><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{["Todas",...CATEGORIES].map(c=>{const[,,tx,em]=CAT_STYLE[c]||["","","#6a8090",""];const active=catF===c;return<button key={c} onClick={()=>setCatF(c)} style={{background:active?"#0b1825":"transparent",border:`1px solid ${active?tx:"#192a38"}`,color:active?tx:"#2a3d50",borderRadius:7,padding:"6px 10px",cursor:"pointer",fontFamily:"inherit",fontSize:10,fontWeight:700,transition:"all .15s"}}>{em?`${em} ${c}`:c}</button>;})}</div></div>
      <Card sx={{overflow:"hidden"}}><table><thead><tr><th>Código</th><th>Nombre</th><th>Cat.</th><th>P./Kg</th><th>Bulto</th><th>P.Unit.</th><th></th></tr></thead>
        <tbody>{vis.map((p:any)=>{const[,,catTx,catEm]=CAT_STYLE[p.cat]||["","","#fff",""];return(<tr key={p.id}><td style={{fontFamily:"monospace",fontSize:11,color:"#00d4ff",fontWeight:700}}>{p.code||"—"}</td><td style={{fontWeight:700,color:"#a0bcd0"}}>{catEm} {p.name}</td><td><span style={{fontSize:9,background:"#192a38",color:catTx,padding:"2px 7px",borderRadius:10,fontWeight:700}}>{p.cat}</span></td><td style={{color:"#00cc55"}}>{p.unit==="kg"?`$${p.pricePerKg.toFixed(2)}/kg`:"—"}</td><td style={{color:"#3388ff"}}>{p.unit==="kg"&&p.bulkWeight>0?`${fmtW(p.bulkWeight)} $${p.bulkPrice}`:"—"}</td><td style={{color:"#cc44ff"}}>{p.unit!=="kg"?`$${(p.unitPrice||0).toFixed(2)}`:"—"}</td><td style={{display:"flex",gap:4}}><Btn v="gh" sx={{padding:"3px 6px",fontSize:9}} onClick={()=>openEdit(p)}><Ic n="edit" s={11}/></Btn><Btn v="r" sx={{padding:"3px 6px",fontSize:9}} onClick={()=>setConfirmDel(p)}><Ic n="del" s={11}/></Btn></td></tr>);})}</tbody>
      </table></Card>
      {confirmDel&&(<Modal close={()=>setConfirmDel(null)} w={360}><div style={{padding:24,textAlign:"center"}}><div style={{fontSize:36,marginBottom:12}}>🗑️</div><h2 style={{margin:"0 0 8px",fontSize:16,fontWeight:800}}>¿Eliminar?</h2><p style={{color:"#6a8090",fontSize:13,marginBottom:20}}><strong style={{color:"#a0bcd0"}}>{confirmDel.name}</strong></p><div style={{display:"flex",gap:10,justifyContent:"center"}}><Btn v="gh" onClick={()=>setConfirmDel(null)}>Cancelar</Btn><Btn v="r" onClick={()=>del(confirmDel.id)}><Ic n="del" s={13}/>Eliminar</Btn></div></div></Modal>)}
      {modal&&form&&(<Modal close={()=>setModal(false)}><div style={{padding:22}}><h2 style={{margin:"0 0 16px",fontSize:15,fontWeight:800}}>{form.id?"Editar":"Nuevo"} Producto</h2><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:11}}><div><Lbl t="Código"/><Inp value={form.code||""} onChange={(e:any)=>setForm((f:any)=>({...f,code:e.target.value}))} placeholder="ej: 1001"/></div><div><Lbl t="Nombre"/><Inp value={form.name} onChange={(e:any)=>setForm((f:any)=>({...f,name:e.target.value}))}/></div><div><Lbl t="Categoría"/><Sel value={form.cat} onChange={(e:any)=>setForm((f:any)=>({...f,cat:e.target.value}))}>{CATEGORIES.map(c=><option key={c}>{c}</option>)}</Sel></div><div><Lbl t="Tipo"/><Sel value={form.unit} onChange={(e:any)=>setForm((f:any)=>({...f,unit:e.target.value}))}><option value="kg">Por Peso (kg)</option><option value="u">Por Unidad</option></Sel></div>{isKg&&<><div><Lbl t="Precio/Kg ($)"/><Inp type="number" step=".01" value={form.pricePerKg} onChange={(e:any)=>setForm((f:any)=>({...f,pricePerKg:parseFloat(e.target.value)||0}))}/></div><div><Lbl t="Peso Bulto (kg)"/><Inp type="number" step=".5" value={form.bulkWeight} onChange={(e:any)=>setForm((f:any)=>({...f,bulkWeight:parseFloat(e.target.value)||0}))}/></div><div><Lbl t="Precio Bulto ($)"/><Inp type="number" step=".01" value={form.bulkPrice} onChange={(e:any)=>setForm((f:any)=>({...f,bulkPrice:parseFloat(e.target.value)||0}))}/></div></>}{!isKg&&<div><Lbl t="Precio Unitario ($)"/><Inp type="number" step=".01" value={form.unitPrice||0} onChange={(e:any)=>setForm((f:any)=>({...f,unitPrice:parseFloat(e.target.value)||0}))}/></div>}</div><div style={{display:"flex",gap:9,marginTop:16,justifyContent:"flex-end"}}><Btn v="gh" onClick={()=>setModal(false)}>Cancelar</Btn><Btn v="g" onClick={save} disabled={saving}>{saving?"Guardando...":"Guardar"}</Btn></div></div></Modal>)}
    </div>
  );
}

function UserMgmt({users,notify,session,loadAll,localeNames}:any) {
  const[modal,setModal]=useState(false);const[form,setForm]=useState<any>(null);const[saving,setSaving]=useState(false);
  const openNew=()=>{setForm({name:"",username:"",password:"",role:"vendedor",local:"",active:true});setModal(true);};
  const openEdit=(u:any)=>{setForm({...u});setModal(true);};
  const save=async()=>{
    if(!form.name||!form.username||!form.password){notify("Completá todos los campos","err");return;}
    setSaving(true);
    try{
      if(form.id) await sb.from("gp_users").update({name:form.name,username:form.username,password:form.password,role:form.role,local:form.local||"",active:form.active}).eq("id",form.id);
      else{
        const dup=users.find((u:any)=>u.username===form.username);
        if(dup){notify("Username ya existe","err");setSaving(false);return;}
        await sb.from("gp_users").insert([{name:form.name,username:form.username,password:form.password,role:form.role,local:form.local||"",active:form.active!==false}]);
      }
      notify(form.id?"Actualizado":"Creado");loadAll();setModal(false);
    }catch(e){notify("Error","err");}
    setSaving(false);
  };
  const toggle=async(u:any)=>{if(u.id===session.id){notify("No podés desactivarte","err");return;}await sb.from("gp_users").update({active:!u.active}).eq("id",u.id);loadAll();};
  const del=async(id:any)=>{if(id===session.id){notify("No podés eliminarte","err");return;}await sb.from("gp_users").delete().eq("id",id);notify("Eliminado");loadAll();};
  const LOCALES_OPT=["", ...localeNames];
  return(
    <div className="fade">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}><div><h1 style={{fontSize:18,fontWeight:800,margin:0}}>Usuarios</h1><p style={{color:"#2a3d50",fontSize:9,margin:"3px 0 0",letterSpacing:2.5}}>{users.length} USUARIOS</p></div><Btn v="g" onClick={openNew}><Ic n="plus" s={13}/>Nuevo</Btn></div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(255px,1fr))",gap:12}}>
        {users.map((u:any)=>(<Card key={u.id} sx={{padding:17}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}><div style={{display:"flex",alignItems:"center",gap:9}}><div style={{width:34,height:34,borderRadius:"50%",background:u.role==="admin"?"#110310":"#021210",border:`2px solid ${u.role==="admin"?"#cc44ff33":"#00883333"}`,display:"flex",alignItems:"center",justifyContent:"center"}}><Ic n={u.role==="admin"?"shld":"usr"} s={14} c={u.role==="admin"?"#cc44ff":"#00cc55"}/></div><div><div style={{fontSize:13,fontWeight:800,color:"#bdd0e0"}}>{u.name}</div><div style={{fontSize:9,color:"#2a3d50",fontFamily:"monospace"}}>@{u.username}{u.local&&<span style={{marginLeft:5,color:"#00d4ff"}}>· 📍{u.local}</span>}</div></div></div><Chip t={u.role}/></div><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:8,fontWeight:700,background:u.active?"#021408":"#130900",color:u.active?"#00cc55":"#ff9900",padding:"3px 9px",borderRadius:10,letterSpacing:1}}>{u.active?"ACTIVO":"INACTIVO"}</span>{u.id!==session.id&&(<div style={{display:"flex",gap:5}}><Btn v="gh" sx={{padding:"3px 6px",fontSize:9}} onClick={()=>openEdit(u)}><Ic n="edit" s={11}/></Btn><Btn v="gh" sx={{padding:"3px 6px",fontSize:9,color:u.active?"#ff5555":"#00cc55"}} onClick={()=>toggle(u)}>{u.active?"Off":"On"}</Btn><Btn v="r" sx={{padding:"3px 6px",fontSize:9}} onClick={()=>del(u.id)}><Ic n="del" s={11}/></Btn></div>)}{u.id===session.id&&<span style={{fontSize:9,color:"#2a3d50"}}>← vos</span>}</div></Card>))}
      </div>
      {modal&&form&&(<Modal close={()=>setModal(false)} w={420}><div style={{padding:22}}><h2 style={{margin:"0 0 16px",fontSize:15,fontWeight:800}}>{form.id?"Editar":"Nuevo"} Usuario</h2><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:11}}><div style={{gridColumn:"1/-1"}}><Lbl t="Nombre"/><Inp value={form.name} onChange={(e:any)=>setForm((f:any)=>({...f,name:e.target.value}))}/></div><div><Lbl t="Username"/><Inp value={form.username} onChange={(e:any)=>setForm((f:any)=>({...f,username:e.target.value}))}/></div><div><Lbl t="Contraseña"/><Inp value={form.password} onChange={(e:any)=>setForm((f:any)=>({...f,password:e.target.value}))}/></div><div><Lbl t="Rol"/><Sel value={form.role} onChange={(e:any)=>setForm((f:any)=>({...f,role:e.target.value}))}><option value="vendedor">Vendedor</option><option value="admin">Admin</option></Sel></div><div><Lbl t="Local"/><Sel value={form.local||""} onChange={(e:any)=>setForm((f:any)=>({...f,local:e.target.value}))}>{LOCALES_OPT.map(l=><option key={l} value={l}>{l||"— Sin local —"}</option>)}</Sel></div><div style={{gridColumn:"1/-1",display:"flex",alignItems:"center",gap:8}}><input type="checkbox" checked={form.active!==false} onChange={(e:any)=>setForm((f:any)=>({...f,active:e.target.checked}))} style={{accentColor:"#00cc55"}}/><span style={{fontSize:12,color:"#6a8090"}}>Activo</span></div></div><div style={{display:"flex",gap:9,marginTop:14,justifyContent:"flex-end"}}><Btn v="gh" onClick={()=>setModal(false)}>Cancelar</Btn><Btn v="g" onClick={save} disabled={saving}>{saving?"Guardando...":"Guardar"}</Btn></div></div></Modal>)}
    </div>
  );
}

function AdminProfile({session,setSession,notify,loadAll}:any) {
  const[name,setName]=useState(session.name);const[username,setUsername]=useState(session.username);const[pwOld,setPwOld]=useState("");const[pwNew,setPwNew]=useState("");const[pwConf,setPwConf]=useState("");const[showPw,setShowPw]=useState(false);const[saving,setSaving]=useState(false);
  const saveProfile=async()=>{
    if(!name.trim()||!username.trim()){notify("Campos requeridos","err");return;}
    setSaving(true);
    try{
      await sb.from("gp_users").update({name:name.trim(),username:username.trim()}).eq("id",session.id);
      const updated={...session,name:name.trim(),username:username.trim()};
      setSession(updated);try{sessionStorage.setItem("gp_sess",JSON.stringify(updated));}catch{}
      notify("Perfil actualizado ✓");loadAll();
    }catch(e){notify("Error","err");}
    setSaving(false);
  };
  const savePassword=async()=>{
    const{data:cur}=await sb.from("gp_users").select("password").eq("id",session.id).single();
    if((cur as any)?.password!==pwOld){notify("Contraseña incorrecta","err");return;}
    if(!pwNew||pwNew.length<4){notify("Mínimo 4 caracteres","err");return;}
    if(pwNew!==pwConf){notify("No coinciden","err");return;}
    setSaving(true);
    try{await sb.from("gp_users").update({password:pwNew}).eq("id",session.id);setPwOld("");setPwNew("");setPwConf("");notify("Contraseña actualizada ✓");}catch(e){notify("Error","err");}
    setSaving(false);
  };
  return(
    <div className="fade" style={{maxWidth:540,margin:"0 auto"}}>
      <div style={{marginBottom:20}}><h1 style={{fontSize:18,fontWeight:800,margin:0}}>Mi Perfil</h1></div>
      <Card sx={{padding:20,marginBottom:14}}>
        <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:18}}><div style={{width:52,height:52,borderRadius:"50%",background:"#110310",border:"2px solid #cc44ff44",display:"flex",alignItems:"center",justifyContent:"center"}}><Ic n="shld" s={22} c="#cc44ff"/></div><div><div style={{fontSize:16,fontWeight:800,color:"#bdd0e0"}}>{session.name}</div><div style={{fontSize:10,color:"#2a3d50"}}>@{session.username} · Admin</div></div></div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:11,marginBottom:14}}><div><Lbl t="Nombre"/><Inp value={name} onChange={(e:any)=>setName(e.target.value)}/></div><div><Lbl t="Username"/><Inp value={username} onChange={(e:any)=>setUsername(e.target.value)}/></div></div>
        <div style={{display:"flex",justifyContent:"flex-end"}}><Btn v="g" onClick={saveProfile} disabled={saving}>{saving?"Guardando...":"Guardar"}</Btn></div>
      </Card>
      <Card sx={{padding:20}}>
        <div style={{fontSize:11,fontWeight:700,color:"#bdd0e0",marginBottom:14,display:"flex",alignItems:"center",gap:7}}><Ic n="key" s={14} c="#00d4ff"/>Cambiar Contraseña</div>
        <div style={{marginBottom:11}}><Lbl t="Actual"/><div style={{position:"relative"}}><Inp type={showPw?"text":"password"} value={pwOld} onChange={(e:any)=>setPwOld(e.target.value)} placeholder="••••••••"/><button onClick={()=>setShowPw((s:boolean)=>!s)} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:"#2a3d50",cursor:"pointer",fontSize:11}}>{showPw?"🙈":"👁"}</button></div></div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:11,marginBottom:11}}><div><Lbl t="Nueva"/><Inp type={showPw?"text":"password"} value={pwNew} onChange={(e:any)=>setPwNew(e.target.value)}/></div><div><Lbl t="Confirmar"/><Inp type={showPw?"text":"password"} value={pwConf} onChange={(e:any)=>setPwConf(e.target.value)}/></div></div>
        {pwNew&&pwConf&&<div style={{fontSize:11,marginBottom:10,color:pwNew===pwConf?"#00cc55":"#ff6666"}}>{pwNew===pwConf?"✓ Coinciden":"✗ No coinciden"}</div>}
        <div style={{display:"flex",justifyContent:"flex-end"}}><Btn v="cy" onClick={savePassword} disabled={saving}><Ic n="key" s={13}/>Actualizar</Btn></div>
      </Card>
    </div>
  );
}
