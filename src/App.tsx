// @ts-nocheck
import { useState, useCallback, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL  = "https://mmjadwmtfpfvvedybvmn.supabase.co";
const SUPABASE_KEY  = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tamFkd210ZnBmdnZlZHlidm1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3MTc4MzMsImV4cCI6MjA4ODI5MzgzM30.uvZtH9YxQDXlyz_eb8TZVitiYE55Q0nFOPX5Iul0teo";
const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

const POINT_VALUE  = 1.00;
const POINTS_DENOM = 500;
const MAX_DISC_PCT = 0.30;
const PAY_OPTS     = ["efectivo","tarjeta","QR"];
const CATEGORIES   = ["Perro","Gato","Accesorios","Granja","Golosinas"];
const todayStr     = () => new Date().toISOString().split("T")[0];

const CAT_STYLE = {
  "Perro":      ["#060f1a","#4488ff22","#5599ff","🐶"],
  "Gato":       ["#0a080f","#cc44ff22","#dd66ff","🐱"],
  "Accesorios": ["#080f0a","#44dd8822","#55ee99","🛍️"],
  "Granja":     ["#0a0900","#aacc0022","#ccee44","🌾"],
  "Golosinas":  ["#0a0508","#ff44aa22","#ff88cc","🍬"],
};
const PAY_STYLE = {
  "efectivo":["#031508","#00994422","#00bb55"],
  "tarjeta": ["#030d1a","#2266ee22","#3388ff"],
  "QR":      ["#0a0a03","#aacc0022","#ccee00"],
  "admin":   ["#12040e","#dd44aa22","#ff66cc"],
  "vendedor":["#031212","#00bbbb22","#00dddd"],
  "granel":  ["#031508","#00cc6622","#00ee77"],
  "bulto":   ["#030a18","#2288ff22","#44aaff"],
  "unidad":  ["#0a0808","#ff882222","#ff9944"],
};

const fmtW = (kg) => {
  if(kg===0) return "0 g";
  if(Math.abs(kg)<1) return `${Math.round(kg*1000)} g`;
  if(Math.abs(kg)<10) return `${parseFloat(kg.toFixed(3))} kg`;
  return `${parseFloat(kg.toFixed(2))} kg`;
};

const fmtM = (n) => {
  if(n===undefined||n===null||isNaN(n)) return "$0,00";
  return "$"+Number(n).toLocaleString("es-AR",{minimumFractionDigits:2,maximumFractionDigits:2});
};

const IP = {
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

const Ic = ({n,s=16,c="currentColor"}) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    {(IP[n]||"").split("M").slice(1).map((d,i)=><path key={i} d={"M"+d}/>)}
  </svg>
);

const Lbl = ({t}) => <div style={{fontSize:9,fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:"#ffffff",marginBottom:5}}>{t}</div>;
const Inp = ({sx,...p}) => (
  <input {...p} style={{background:"#060f1a",border:"1px solid #192a38",color:"#ffffff",padding:"9px 12px",borderRadius:6,fontFamily:"inherit",fontSize:13,outline:"none",width:"100%",boxSizing:"border-box",transition:"border .15s",...sx}}
    onFocus={(e)=>e.target.style.borderColor="#00d4ff"} onBlur={(e)=>e.target.style.borderColor="#192a38"}/>
);
const Sel = ({sx,children,...p}) => (
  <select {...p} style={{background:"#060f1a",border:"1px solid #192a38",color:"#ffffff",padding:"9px 12px",borderRadius:6,fontFamily:"inherit",fontSize:13,outline:"none",width:"100%",boxSizing:"border-box",...sx}}>
    {children}
  </select>
);
const Chip = ({t}) => {
  const s=PAY_STYLE[t]||CAT_STYLE[t]||["#111","#44444422","#777"];
  const[bg,bd,tx]=s;
  return <span style={{display:"inline-flex",alignItems:"center",gap:4,padding:"2px 9px",borderRadius:20,fontSize:9,fontWeight:700,letterSpacing:.8,background:bg,border:`1px solid ${bd}`,color:tx,textTransform:"uppercase",whiteSpace:"nowrap"}}>{t}</span>;
};
const Modal = ({close,children,w=520}) => (
  <div onClick={(e)=>e.target===e.currentTarget&&close()} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.85)",backdropFilter:"blur(10px)",zIndex:4000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
    <div style={{background:"#060f1a",border:"1px solid #192a38",borderRadius:14,width:"100%",maxWidth:w,maxHeight:"92vh",overflowY:"auto",boxShadow:"0 50px 120px rgba(0,0,0,.9)"}}>
      {children}
    </div>
  </div>
);
const Card = ({children,sx,className}) => <div className={className} style={{background:"#0b1825",border:"1px solid #192a38",borderRadius:10,...sx}}>{children}</div>;
const Btn = ({v="g",children,sx,...p}) => {
  const vs={
    g:{bg:"#008833",fg:"#011208",hv:"#00aa44"},
    b:{bg:"#082244",fg:"#3388ff",hv:"#0c2a54",bd:"1px solid #143a7a"},
    gh:{bg:"transparent",fg:"#3d5060",hv:"#0b1825",bd:"1px solid #192a38"},
    r:{bg:"#180505",fg:"#ff5555",hv:"#200808",bd:"1px solid #300a0a"},
    or:{bg:"#140800",fg:"#ff9900",hv:"#1c1000",bd:"1px solid #301800"},
    cy:{bg:"#011518",fg:"#00d4ff",hv:"#021c20",bd:"1px solid #003a44"},
    pu:{bg:"#0e040f",fg:"#cc44ff",hv:"#14061a",bd:"1px solid #2a0a30"},
  }[v]||{};
  return <button {...p} style={{display:"inline-flex",alignItems:"center",gap:6,padding:"9px 16px",borderRadius:7,cursor:"pointer",fontFamily:"inherit",fontSize:11,fontWeight:700,letterSpacing:.8,textTransform:"uppercase",border:vs.bd||"none",background:vs.bg,color:vs.fg,transition:"all .15s",...sx}}
    onMouseEnter={(e)=>{e.currentTarget.style.background=vs.hv;e.currentTarget.style.transform="translateY(-1px)"}}
    onMouseLeave={(e)=>{e.currentTarget.style.background=vs.bg;e.currentTarget.style.transform=""}}>{children}</button>;
};
const Stat = ({label,value,sub,color="#00d4ff",icon}) => (
  <Card sx={{padding:"17px 20px",position:"relative",overflow:"hidden"}}>
    <div style={{position:"absolute",right:12,top:12,opacity:.07}}><Ic n={icon} s={48} c={color}/></div>
    <div style={{fontSize:8,fontWeight:700,letterSpacing:3,color:"#ffffff",textTransform:"uppercase",marginBottom:8}}>{label}</div>
    <div style={{fontSize:26,fontWeight:800,color,fontVariantNumeric:"tabular-nums",lineHeight:1}}>{value}</div>
    {sub&&<div style={{fontSize:10,color:"#ffffff",marginTop:4}}>{sub}</div>}
  </Card>
);

const mapUser   = (r) => r?({id:r.id,name:r.name,username:r.username,password:r.password,role:r.role,local:r.local||"",active:r.active}):null;
const mapProd   = (r) => r?({id:r.id,code:r.code||"",name:r.name,cat:r.cat,unit:r.unit,pricePerKg:Number(r.price_per_kg)||0,bulkWeight:Number(r.bulk_weight)||0,bulkPrice:Number(r.bulk_price)||0,unitPrice:Number(r.unit_price)||0,costo:Number(r.costo)||0,stk:Number(r.stk)||0,min:Number(r.min_stk)||0,active:r.active}):null;
const mapStock  = (r) => r?({id:r.id,productId:r.product_id,localName:r.local_name,stk:Number(r.stk)||0,min:Number(r.min_stk)||0,max:Number(r.max_stk)||0}):null;
const mapClient = (r) => r?({id:r.id,name:r.name,dni:r.dni||"",phone:r.phone||"",email:r.email||"",addr:r.addr||"",pay:r.pay||"efectivo",pts:Number(r.pts)||0,active:r.active}):null;
const mapSale   = (r) => r?({id:r.id,date:r.date,cid:r.cid,items:r.items||[],sub:Number(r.sub)||0,disc:Number(r.disc)||0,total:Number(r.total)||0,pay:r.pay,ptsE:r.pts_e||0,ptsS:r.pts_s||0,uid:r.uid,localName:r.local_name||""}):null;
const mapCaja   = (r) => r?({id:r.id,closedAt:r.closed_at,closedBy:r.closed_by,closedByName:r.closed_by_name||"",saleIds:r.sale_ids||[],byPay:r.by_pay||{},totalEf:Number(r.total_ef)||0,totalDig:Number(r.total_dig)||0,totalAll:Number(r.total_all)||0,openingAmount:Number(r.opening_amount)||0,retiro_efectivo:Number(r.retiro_efectivo)||0,notes:r.notes||"",salesCount:r.sales_count||0,localName:r.local_name||""}):null;
const mapLocale = (r) => r?({id:r.id,name:r.name}):null;

const Login = ({onLogin}) => {
  const[un,setUn]=useState("");const[pw,setPw]=useState("");const[err,setErr]=useState("");const[loading,setLoading]=useState(false);
  const go=async()=>{
    setLoading(true);setErr("");
    try{
      const{data,error}=await sb.from("gp_users").select("*").eq("username",un).eq("password",pw).eq("active",true).single();
      if(error||!data){setErr("Usuario o contraseña incorrectos");}
      else{
        // Generar token de sesión único y guardarlo en el usuario
        const sessionToken=Date.now().toString(36)+Math.random().toString(36).slice(2);
        await sb.from("gp_users").update({session_token:sessionToken}).eq("id",data.id);
        onLogin({...mapUser(data),sessionToken});
      }
    }catch(e){setErr("Error de conexión.");}
    setLoading(false);
  };
  return(
    <div style={{minHeight:"100vh",background:"#030810",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{width:380,padding:"42px 36px",background:"#060f1a",border:"1px solid #192a38",borderRadius:18,boxShadow:"0 50px 100px rgba(0,0,0,.8)"}}>
        <div style={{textAlign:"center",marginBottom:30}}>
          <div style={{fontSize:40,marginBottom:10}}>🐾</div>
          <div style={{fontSize:24,fontWeight:800,color:"#ffffff",letterSpacing:-1}}>GranelPro</div>
          <div style={{fontSize:9,color:"#ffffff",letterSpacing:3,marginTop:3}}>SISTEMA PET SHOP · ONLINE</div>
        </div>
        <div style={{marginBottom:12}}><Lbl t="Usuario"/><Inp placeholder="usuario" value={un} onChange={(e)=>setUn(e.target.value)} onKeyDown={(e)=>e.key==="Enter"&&go()}/></div>
        <div style={{marginBottom:18}}><Lbl t="Contraseña"/><Inp type="password" placeholder="••••••••" value={pw} onChange={(e)=>setPw(e.target.value)} onKeyDown={(e)=>e.key==="Enter"&&go()}/></div>
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
  const[session,setSession]=useState(()=>{try{const s=sessionStorage.getItem("gp_sess");return s?JSON.parse(s):null;}catch{return null;}});
  const[users,setUsers]=useState([]);
  const[prods,setProds]=useState([]);
  const[stock,setStock]=useState([]);
  const[clients,setClients]=useState([]);
  const[sales,setSales]=useState([]);
const[caja,setCaja]=useState([]);
const[locales,setLocales]=useState([]);
const[stockMgt,setStockMgt]=useState([]);
const[loading,setLoading]=useState(true);
const[view,setView]=useState("dash");
  const[toast,setToast]=useState(null);
  const[online,setOnline]=useState(navigator.onLine);
  const[persistCart,setPersistCart]=useState([]);
  const[persistCid,setPersistCid]=useState("");
  const[persistCliQ,setPersistCliQ]=useState("");
  const[persistPay,setPersistPay]=useState("");
  const isAdmin=session?.role==="admin";

  const notify=(msg,t="ok")=>{setToast({msg,t});setTimeout(()=>setToast(null),3400);};

  useEffect(()=>{
    if(!session) return;
    // Verificar cada 30 segundos que la sesión sigue siendo válida
    const checkSession=async()=>{
      const{data}=await sb.from("gp_users").select("session_token").eq("id",session.id).single();
      if(data&&session.sessionToken&&data.session_token!==session.sessionToken){
        // Otra sesión tomó el control — cerrar esta
        handleLogout();
        alert("Tu sesión fue cerrada porque el usuario inició sesión en otro dispositivo.");
      }
    };
    const interval=setInterval(checkSession,30000);
    return()=>clearInterval(interval);
  },[session]);

  useEffect(()=>{
    const on=()=>setOnline(true);const off=()=>setOnline(false);
    window.addEventListener("online",on);window.addEventListener("offline",off);
    return()=>{window.removeEventListener("online",on);window.removeEventListener("offline",off);};
  },[]);

  const loadAll=useCallback(async()=>{
    const isAdminSession=session?.role==="admin";
    try{
      // Cargar clientes con paginación (pueden superar 1000)
      const loadClients=async()=>{
        let all=[];let from=0;const size=1000;
        while(true){
          const{data,error}=await sb.from("gp_clients").select("*").order("id").range(from,from+size-1);
          if(error||!data||data.length===0) break;
          all=[...all,...data];
          if(data.length<size) break;
          from+=size;
        }
        return all;
      };
      // Admin: todas las ventas paginadas. Vendedor: solo ventas de hoy de su local
      const loadSales=async()=>{
        if(isAdminSession){
          let all=[];let from=0;const size=1000;
          while(true){
            const{data,error}=await sb.from("gp_sales").select("*").order("id",{ascending:false}).range(from,from+size-1);
            if(error||!data||data.length===0) break;
            all=[...all,...data];
            if(data.length<size) break;
            from+=size;
          }
          return all;
        } else {
          // Vendedor: solo ventas de hoy
          const{data}=await sb.from("gp_sales").select("*").eq("date",todayStr()).order("id",{ascending:false});
          return data||[];
        }
      };
      const[u,p,sk,cj,lc,c,s]=await Promise.all([
        sb.from("gp_users").select("*").order("id"),
        sb.from("gp_products").select("*").order("id"),
        sb.from("gp_stock").select("*").range(0,4999),
        sb.from("gp_caja").select("*").order("id"),
        sb.from("gp_locales").select("*").order("id"),
        loadClients(),
        loadSales(),
      ]);
      if(!u.error) setUsers((u.data||[]).map(mapUser));
      if(!p.error) setProds((p.data||[]).map(mapProd));
      if(!sk.error) setStock((sk.data||[]).map(mapStock));
      setClients((c||[]).map(mapClient));
      setSales((s||[]).map(mapSale));
      if(!cj.error) setCaja((cj.data||[]).map(mapCaja));
      if(!lc.error) setLocales((lc.data||[]).map(mapLocale));
    }catch(e){notify("Error cargando datos","err");}
  },[session]);

  const loadFirst=useCallback(async()=>{
    setLoading(true);await loadAll();setLoading(false);
  },[loadAll]);

  useEffect(()=>{
    if(!session) return;
    loadFirst();
    const ch=sb.channel("gp_rt")
      .on("postgres_changes",{event:"*",schema:"public",table:"gp_products"},()=>loadAll())
      .on("postgres_changes",{event:"*",schema:"public",table:"gp_stock"},()=>{if(view!=="stockmgt")loadAll();})
      .on("postgres_changes",{event:"*",schema:"public",table:"gp_clients"},()=>loadAll())
      .on("postgres_changes",{event:"*",schema:"public",table:"gp_sales"},()=>loadAll())
      .on("postgres_changes",{event:"*",schema:"public",table:"gp_caja"},()=>loadAll())
      .on("postgres_changes",{event:"*",schema:"public",table:"gp_users"},()=>loadAll())
      .on("postgres_changes",{event:"*",schema:"public",table:"gp_locales"},()=>loadAll())
      .subscribe();
    return()=>{sb.removeChannel(ch);};
  },[session,loadFirst,loadAll]);

  const handleLogin=(u)=>{const withTime={...u,loginAt:new Date().toISOString()};setSession(withTime);setView(u.role==="admin"?"dash":"sale");try{sessionStorage.setItem("gp_sess",JSON.stringify(withTime));}catch{}};
  const handleLogout=()=>{setSession(null);try{sessionStorage.removeItem("gp_sess");}catch{};setView("dash");};

  const localeNames=locales.length>0?locales.map((l)=>l.name):["Centro","Norte","Sur"];
  const getStk=(pid,loc)=>{const s=stock.find(s=>s.productId===pid&&s.localName===loc);return s?s.stk:0;};
  const prodsWithStk=prods.map(p=>({...p,stk:isAdmin?p.stk:getStk(p.id,session?.local||"")}));

  if(!session) return(
    <div style={{fontFamily:"'Outfit','Trebuchet MS',sans-serif"}}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;800;900&display=swap" rel="stylesheet"/>
      <Login onLogin={handleLogin}/>
    </div>
  );

  const nav=[
    ...(isAdmin?[{v:"dash",icon:"db",label:"Dashboard"}]:[]),
    {v:"sale",   icon:"cart", label:"Nueva Venta"},
    {v:"history",icon:"hist", label:"Ventas"},
    {v:"clients",icon:"users",label:"Clientes"},
    {v:"caja",   icon:"cash", label:"Cierre Caja"},
    ...(isAdmin?[
      {v:"prods",     icon:"box",  label:"Productos"},
      {v:"stockmgt",  icon:"stk",  label:"Stock x Local"},
      {v:"traslados",  icon:"trend",label:"Traslados"},
      {v:"rentab",     icon:"cash", label:"Rentabilidad"},
      {v:"proveedores",icon:"usr",  label:"Proveedores"},
      {v:"rpt_prov",   icon:"rpt",  label:"Reporte Prov."},
      {v:"gastos",     icon:"cash", label:"Gastos"},
      {v:"empleados",  icon:"users",label:"Empleados"},
      {v:"localmgt",  icon:"loc",  label:"Locales"},
      {v:"reporte",   icon:"rpt",  label:"Reportes"},
      {v:"usermgt",   icon:"shld", label:"Usuarios"},
      {v:"perfil",    icon:"pfil", label:"Mi Perfil"},
    ]:[]),
  ];

  return(
    <div style={{fontFamily:"'Outfit','Trebuchet MS',sans-serif",background:"#030810",minHeight:"100vh",color:"#ffffff"}}>
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
        td{padding:11px 14px;font-size:12px;border-bottom:1px solid #192a3814;color:#ffffff;vertical-align:middle}
        tr:hover td{background:#06111e}
        tr:last-child td{border-bottom:none}
        input::placeholder{color:#ffffff !important;opacity:0.7}
        input[type=number]::-webkit-inner-spin-button{display:none}
        input[type=number]::-webkit-outer-spin-button{display:none}
        input[type=number]{-moz-appearance:textfield}
        @media print{
          body *{visibility:hidden !important}
          .print-receipt, .print-receipt *{visibility:visible !important}
          .print-receipt{
            display:block !important;
            position:fixed !important;
            top:0 !important;left:0 !important;
            width:100% !important;
            background:#fff !important;
            color:#000 !important;
            font-family:monospace !important;
            padding:20px !important;
            font-size:13px !important;
          }
          .print-receipt *{color:#000 !important;background:transparent !important;border-color:#000 !important;-webkit-print-color-adjust:exact;print-color-adjust:exact}
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
                <div style={{fontSize:14,fontWeight:800,color:"#ffffff",letterSpacing:-0.5}}>GranelPro</div>
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
                <div style={{fontSize:11,fontWeight:700,color:"#ffffff",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{session.name}</div>
                <div style={{display:"flex",gap:4,alignItems:"center",flexWrap:"wrap"}}>
                  <Chip t={session.role}/>
                  {session.local&&<span style={{fontSize:8,color:"#00d4ff"}}>📍{session.local}</span>}
                </div>
              </div>
            </div>
          </div>
          <nav style={{flex:1,padding:"6px 0",overflow:"auto"}}>
            {nav.map(({v,icon,label})=>(
              <button key={v} onClick={()=>setView(v)} style={{display:"flex",alignItems:"center",gap:8,padding:"9px 14px",width:"100%",background:view===v?"#051626":"none",border:"none",borderLeft:`3px solid ${view===v?"#00d4ff":"transparent"}`,color:view===v?"#00d4ff":"#ffffff",cursor:"pointer",fontFamily:"inherit",fontSize:11,fontWeight:600,letterSpacing:1.2,textTransform:"uppercase",transition:"all .15s"}}>
                <Ic n={icon} s={13}/>{label}
              </button>
            ))}
          </nav>
          <div style={{padding:"10px 13px",borderTop:"1px solid #192a38"}}>
            <button onClick={handleLogout} style={{display:"flex",alignItems:"center",gap:7,background:"none",border:"none",color:"#ffffff",cursor:"pointer",fontFamily:"inherit",fontSize:10,fontWeight:600,letterSpacing:1,padding:0,width:"100%"}} onMouseEnter={(e)=>e.currentTarget.style.color="#bdd0e0"} onMouseLeave={(e)=>e.currentTarget.style.color="#2a3d50"}>
              <Ic n="out" s={12}/>Salir
            </button>
          </div>
        </aside>
        <main style={{flex:1,overflow:"auto",padding:22}}>
          {loading?(
            <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100%",flexDirection:"column",gap:14,color:"#ffffff"}}>
              <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="#00d4ff" strokeWidth={2} strokeLinecap="round" style={{animation:"spin 1s linear infinite"}}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
              <span style={{fontSize:12}}>Conectando...</span>
            </div>
          ):<>
            {view==="dash"    &&<Dashboard prods={prodsWithStk} clients={clients} sales={sales} users={users} session={session} isAdmin={isAdmin} setView={setView} stock={stock} localeNames={localeNames}/>}
            {view==="sale"    &&<NewSale prods={prodsWithStk} clients={clients} notify={notify} session={session} stock={stock} loadAll={loadAll} isAdmin={isAdmin} persistCart={persistCart} setPersistCart={setPersistCart} persistCid={persistCid} setPersistCid={setPersistCid} persistCliQ={persistCliQ} setPersistCliQ={setPersistCliQ} persistPay={persistPay} setPersistPay={setPersistPay}/>}
            {view==="history" &&<History sales={sales} clients={clients} users={users} isAdmin={isAdmin} notify={notify} loadAll={loadAll} session={session}/>}
            {view==="clients" &&<Clients clients={clients} sales={sales} notify={notify} isAdmin={isAdmin} loadAll={loadAll}/>}
            {view==="caja"    &&<CashClose sales={sales} caja={caja} notify={notify} session={session} loadAll={loadAll} isAdmin={isAdmin} locales={locales} users={users}/>}
            {isAdmin&&view==="prods"    &&<Products prods={prods} notify={notify} loadAll={loadAll}/>}
            {isAdmin&&view==="stockmgt" &&<StockMgt prods={prods} notify={notify} localeNames={localeNames} stockMgt={stockMgt} setStockMgt={setStockMgt} session={session}/>}
            {isAdmin&&view==="traslados" &&<Traslados prods={prods} localeNames={localeNames} notify={notify} session={session} loadAll={loadAll}/>}
            {isAdmin&&view==="rentab"    &&<Rentabilidad prods={prods} sales={sales} stock={stock} localeNames={localeNames} stockMgt={stockMgt}/>}
            {isAdmin&&view==="proveedores" &&<Proveedores notify={notify}/>}
            {isAdmin&&view==="rpt_prov"    &&<ReporteProveedores sales={sales}/>}
            {isAdmin&&view==="gastos"      &&<Gastos notify={notify}/>}
            {isAdmin&&view==="empleados"   &&<Empleados notify={notify}/>}
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

function Dashboard({prods,clients,sales,users,session,isAdmin,setView,stock,localeNames}) {
  const td=todayStr();
  const st=sales.filter((s)=>s.date===td);
  const hoy=st.reduce((a,b)=>a+b.total,0);
  const mes=sales.reduce((a,b)=>a+b.total,0);
  const getCritical=()=>{
    if(isAdmin){
      const all=[];
      prods.forEach((p)=>{
        localeNames.forEach((loc)=>{
          const s=stock.find((s)=>s.productId===p.id&&s.localName===loc);
          const stk=s?s.stk:0;const min=s?s.min:0;
          if(stk<0) all.push({...p,stk,localName:loc,isNeg:true});
          else if(min>0&&stk<=min) all.push({...p,stk,localName:loc,isNeg:false});
        });
      });
      return all;
    } else {
      return prods.map((p)=>{
        const s=stock.find((s)=>s.productId===p.id&&s.localName===session?.local);
        const stk=s?s.stk:p.stk;const min=s?s.min:0;
        return{...p,stk,localName:session?.local,minLocal:min,isNeg:stk<0};
      }).filter((p)=>p.stk<0||(p.minLocal>0&&p.stk<=p.minLocal));
    }
  };
  const critical=getCritical();
  return(
    <div className="fade">
      <div style={{marginBottom:20}}>
        <h1 style={{fontSize:20,fontWeight:800,margin:0}}>Dashboard 🐾</h1>
        <p style={{color:"#ffffff",fontSize:9,margin:"4px 0 0",letterSpacing:2.5}}>{new Date().toLocaleDateString("es-AR",{weekday:"long",year:"numeric",month:"long",day:"numeric"}).toUpperCase()}{!isAdmin&&session?.local&&<span style={{marginLeft:8,color:"#00d4ff"}}>· LOCAL {session.local.toUpperCase()}</span>}</p>
      </div>
      {isAdmin&&<div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:16}}>
        <Stat label="Ventas Hoy" value={`${fmtM(hoy)}`} sub={`${st.length} operaciones`} color="#00cc55" icon="trend"/>
        <Stat label="Total Mes" value={`${fmtM(mes)}`} sub={`${sales.length} ventas`} color="#00d4ff" icon="hist"/>
        <Stat label="Stock Bajo" value={critical.filter((p)=>!p.isNeg).length} sub="todos los locales" color="#ff9900" icon="warn"/>
        <Stat label="Stock Negativo" value={critical.filter((p)=>p.isNeg).length} sub="por debajo de 0" color={critical.filter((p)=>p.isNeg).length>0?"#ff4444":"#00cc55"} icon="warn"/>
      </div>}
      {isAdmin&&<div style={{display:"grid",gridTemplateColumns:"1.8fr 1fr",gap:14,marginBottom:14}}>
        <Card sx={{overflow:"hidden"}}>
          <div style={{padding:"11px 16px",borderBottom:"1px solid #192a38",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:8,fontWeight:700,letterSpacing:2.5,color:"#ffffff",textTransform:"uppercase"}}>Últimas Ventas</span>
            <Btn v="gh" sx={{padding:"3px 8px",fontSize:9}} onClick={()=>setView("history")}>Ver todas →</Btn>
          </div>
          <table><thead><tr><th>Cliente</th><th>Total</th><th>Pago</th><th>Pts</th><th>Vendedor</th></tr></thead>
            <tbody>{sales.slice(0,8).map((s)=>{const cl=clients.find((c)=>c.id===s.cid);const us=users.find((u)=>u.id===s.uid);return(<tr key={s.id}><td style={{fontWeight:700,color:"#ffffff"}}>{cl?.name||"—"}</td><td style={{color:"#00cc55",fontWeight:800}}>{fmtM(s.total)}</td><td><Chip t={s.pay}/></td><td style={{color:"#ff9900"}}>{s.ptsE>0?`+${s.ptsE}`:"-"}</td><td style={{color:"#ffffff",fontSize:11}}>{us?.name||"—"}</td></tr>);})}</tbody>
          </table>
        </Card>
        <Card sx={{overflow:"hidden"}}>
          <div style={{padding:"11px 16px",borderBottom:"1px solid #192a38"}}><span style={{fontSize:8,fontWeight:700,letterSpacing:2.5,color:"#ffffff",textTransform:"uppercase"}}>⚠ Stock Crítico</span></div>
          {critical.length===0?<div style={{padding:20,color:"#ffffff",textAlign:"center",fontSize:12}}>✓ Todo normal</div>
            :critical.slice(0,8).map((p,i)=>{const[,,,em]=CAT_STYLE[p.cat]||["","","#fff",""];return(
              <div key={i} style={{padding:"7px 15px",borderBottom:"1px solid #192a3810",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div><div style={{fontSize:11,fontWeight:700,color:"#ffffff"}}>{em} {p.name}</div><div style={{fontSize:9,color:"#ffffff"}}>{p.cat}{p.localName?` · ${p.localName}`:""}</div></div>
                <div style={{textAlign:"right"}}><div style={{fontWeight:800,fontSize:12,color:p.isNeg?"#ff4444":"#ff9900"}}>{p.unit==="kg"?fmtW(p.stk):`${p.stk} u`}{p.isNeg?" ⚠":""}</div></div>
              </div>
            );})}
        </Card>
      </div>}
      <Card sx={{overflow:"hidden"}}>
        <div style={{padding:"11px 16px",borderBottom:"1px solid #192a38"}}><span style={{fontSize:8,fontWeight:700,letterSpacing:2.5,color:"#ffffff",textTransform:"uppercase"}}>🏆 Ranking por Puntos</span></div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)"}}>
          {[...clients].sort((a,b)=>b.pts-a.pts).slice(0,4).map((c,i)=>(
            <div key={c.id} style={{padding:"13px 15px",borderRight:"1px solid #192a3810"}}>
              <div style={{fontSize:8,color:"#ffffff",marginBottom:3}}>#{i+1}</div>
              <div style={{fontSize:11,fontWeight:700,color:"#ffffff",marginBottom:4}}>{c.name}</div>
              <div style={{display:"flex",alignItems:"center",gap:5}}><Ic n="star" s={13} c="#ff9900"/><span style={{fontSize:18,fontWeight:800,color:"#ff9900"}}>{c.pts}</span></div>
              <div style={{fontSize:9,color:"#ffffff",marginTop:2}}>≡ {fmtM((c.pts*POINT_VALUE))}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function NewSale({prods,clients,notify,session,stock,loadAll,isAdmin,persistCart,setPersistCart,persistCid,setPersistCid,persistCliQ,setPersistCliQ,persistPay,setPersistPay}) {
  const[cart,setCart_]=useState(persistCart||[]);
  const setCart=(fn)=>{setCart_(prev=>{const next=typeof fn==="function"?fn(prev):fn;setPersistCart(next);return next;});};
  const[cid,setCid_]=useState(persistCid||"");
  const setCid=(v)=>{setCid_(v);setPersistCid(v);};
  const[cliQ,setCliQ_]=useState(persistCliQ||"");
  const setCliQ=(v)=>{setCliQ_(v);setPersistCliQ(v);};
  const[pay,setPay_]=useState(persistPay||"");
  const setPay=(v)=>{setPay_(v);setPersistPay(v);};
  const[pay2,setPay2]=useState("");
  const[mixedMode,setMixedMode]=useState(false);
  const[cashAmount,setCashAmount]=useState("");
  const[date,setDate]=useState(todayStr());
  const[usePts,setUsePts]=useState(false);
  const[ptsIn,setPtsIn]=useState(0);
  const[q,setQ]=useState("");
  const[catF,setCatF]=useState("Todas");
  const[receipt,setReceipt]=useState(null);
  const[showCliList,setShowCliList]=useState(false);
  const[saving,setSaving]=useState(false);
  const[expandedId,setExpandedId]=useState(null);

  const client=clients.find((c)=>c.id===parseInt(cid));
  const filteredClients=clients.filter((c)=>{
    if(!c.active) return false;
    const q=cliQ.toLowerCase().trim();
    if(!q) return false;
    const matchName=c.name.toLowerCase().includes(q);
    const onlyDigits=/^\d+$/.test(cliQ.trim());
    const matchDni=onlyDigits&&c.dni&&c.dni.replace(/\D/g,"").includes(cliQ.trim());
    return matchName||matchDni;
  });
  const visible=prods.filter((p)=>{
    const matchQ=q===""||p.name.toLowerCase().includes(q.toLowerCase())||(p.code&&p.code.toLowerCase().includes(q.toLowerCase()));
    const matchCat=catF==="Todas"||p.cat===catF;
    return matchQ&&matchCat;
  });
  const sub=cart.reduce((a,b)=>a+b.sub,0);
  const ptsUs=usePts?Math.min(parseInt(String(ptsIn))||0,client?.pts||0):0;
  const disc=Math.min(ptsUs*POINT_VALUE,sub*MAX_DISC_PCT);
  const total=Math.max(0,sub-disc);
  const hasEfectivo=pay==="efectivo"&&!mixedMode;
  const ptsMultiplier=hasEfectivo?2:1;
  const ptsE=Math.floor(total/POINTS_DENOM)*ptsMultiplier;
  const cash2=mixedMode?Math.max(0,total-parseFloat(cashAmount||"0")):0;
  const payLabel=mixedMode&&pay2?`efectivo + ${pay2}`:(pay||"");

  const selectClient=(c)=>{setCid(String(c.id));setCliQ(c.name);setShowCliList(false);setUsePts(false);setPtsIn(0);};

  const addToCart=(prod,type,inputValue)=>{
    const val=parseFloat(inputValue);
    if(!val||val<=0){notify("Ingresá un valor válido","err");return;}
    let qty,unitDisplay,sub_val;
    if(type==="granel"&&prod.unit==="kg"){qty=val/prod.pricePerKg;sub_val=val;unitDisplay=fmtW(qty);}
    else if(type==="granel_kg"&&prod.unit==="kg"){qty=val;sub_val=val*prod.pricePerKg;unitDisplay=fmtW(qty);type="granel";}
    else if(type==="bulto"&&prod.unit==="kg"){qty=Math.round(val)*prod.bulkWeight;sub_val=Math.round(val)*prod.bulkPrice;unitDisplay=`${Math.round(val)} bulto${Math.round(val)>1?"s":""} (${fmtW(qty)})`;}
    else{qty=Math.round(val);sub_val=qty*(prod.unitPrice||0);unitDisplay=`${qty} u`;}
    const key=`${prod.id}-${type}`;
    setCart((prev)=>{
      const ex=prev.find(i=>i.key===key);
      if(ex) return prev.map(i=>i.key===key?{...i,qty:i.qty+qty,sub:i.sub+sub_val,unitDisplay:type==="granel"&&prod.unit==="kg"?fmtW(i.qty+qty):type==="unidad"?`${i.qty+qty} u`:type==="bulto"?`${Math.round((i.qty+qty)/prod.bulkWeight)} bultos (${fmtW(i.qty+qty)})`:unitDisplay}:i);
      return[...prev,{key,pid:prod.id,name:prod.name,unit:prod.unit,type,qty,sub:sub_val,unitDisplay}];
    });
  };

  const confirm=async()=>{
    if(!cid){notify("Seleccioná un cliente","err");return;}
    if(!pay){notify("Seleccioná un medio de pago","err");return;}
    if(mixedMode&&!pay2){notify("Seleccioná el segundo medio de pago","err");return;}
    if(mixedMode&&(parseFloat(cashAmount||"0")<=0||parseFloat(cashAmount||"0")>=total)){notify("Ingresá un monto válido en efectivo","err");return;}
    if(!cart.length){notify("Carrito vacío","err");return;}
    if(total<=0){notify("El total no puede ser $0,00","err");return;}
    setSaving(true);
    try{
      const saleId=Date.now();
      const cartSnapshot=[...cart];
      const clientSnapshot={...client};
      const finalPay=mixedMode?`efectivo + ${pay2}`:pay;
      await sb.from("gp_sales").insert([{id:saleId,date,cid:parseInt(cid),items:cartSnapshot,sub,disc,total,pay:finalPay,pts_e:ptsE,pts_s:ptsUs,uid:session.id,local_name:session.local||""}]);

      for(const it of cartSnapshot){
        const prod=prods.find((p)=>p.id===it.pid);
        if(!prod) continue;
        const delta=prod.unit==="kg"?it.qty:(it.type==="bulto"?it.qty/prod.bulkWeight:it.qty);
        const localName=session.local||"";
        const{data:stkRow}=await sb.from("gp_stock").select("*").eq("product_id",it.pid).eq("local_name",localName).single();
        if(stkRow){
          await sb.from("gp_stock").update({stk:stkRow.stk-delta}).eq("id",stkRow.id);
          await sb.from("gp_stock_mov").insert([{id:Date.now()+it.pid,product_id:it.pid,local_name:localName,tipo:"venta",cantidad:delta,stock_antes:stkRow.stk,stock_despues:stkRow.stk-delta,usuario:session.name||session.username||"vendedor",fecha:new Date().toISOString()}]);
        } else {
          await sb.from("gp_stock").insert([{product_id:it.pid,local_name:localName,stk:-delta}]);
          await sb.from("gp_stock_mov").insert([{id:Date.now()+it.pid,product_id:it.pid,local_name:localName,tipo:"venta",cantidad:delta,stock_antes:0,stock_despues:-delta,usuario:session.name||session.username||"vendedor",fecha:new Date().toISOString()}]);
        }
      }

      if(clientSnapshot) await sb.from("gp_clients").update({pts:clientSnapshot.pts-ptsUs+ptsE}).eq("id",clientSnapshot.id);
      const receiptData={sale:{id:saleId,date,pay:finalPay,total,disc,items:cartSnapshot,cashAmount:mixedMode?parseFloat(cashAmount||"0"):null,cash2:mixedMode?cash2:null,pay2:mixedMode?pay2:null},clientName:clientSnapshot?.name,clientDni:clientSnapshot?.dni||"",clientPts:(clientSnapshot?.pts||0)-ptsUs+ptsE,ptsE,ptsUs,local:session.local};
      setCart([]);setCid("");setCliQ("");setUsePts(false);setPtsIn(0);
      setSaving(false);setReceipt(receiptData);loadAll();
    }catch(e){notify("Error al guardar venta","err");setSaving(false);}
  };

  const printReceipt=()=>{
    const el=document.getElementById("receipt-print");
    if(el){el.style.display="block";window.print();setTimeout(()=>{el.style.display="none";},800);}
  };

  if(receipt) return(
    <div className="fade" style={{maxWidth:440,margin:"32px auto"}}>
      <div className="print-receipt" id="receipt-print">
        <div style={{textAlign:"center",borderBottom:"2px dashed #000",paddingBottom:8,marginBottom:8}}>
          <div style={{fontSize:18,fontWeight:900,color:"#000"}}>Masc🐾tas Pet Shop</div>
          <div style={{fontSize:10,color:"#000",marginTop:2}}>RECIBO · #{String(receipt.sale.id).slice(-6)}</div>
          <div style={{fontSize:10,color:"#000"}}>{receipt.sale.date}{receipt.local&&` · ${receipt.local}`}</div>
        </div>
        <div style={{fontSize:11,marginBottom:4,color:"#000"}}>Cliente: {receipt.clientName}{receipt.clientDni&&` · DNI: ${receipt.clientDni}`}</div>
        {receipt.sale.items.map((it,i)=>(<div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3,color:"#000"}}><span>{it.name} ({it.unitDisplay})</span><span>{fmtM(it.sub)}</span></div>))}
        {receipt.sale.disc>0&&<div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#000"}}><span>Desc.</span><span>-{fmtM(receipt.sale.disc)}</span></div>}
        <div style={{borderTop:"2px dashed #000",paddingTop:6,display:"flex",justifyContent:"space-between",fontWeight:900,fontSize:14,color:"#000"}}><span>TOTAL</span><span>{fmtM(receipt.sale.total)}</span></div>
        {receipt.sale.cashAmount&&<div style={{marginTop:4,fontSize:10,color:"#000"}}>
          <div>Efectivo: {fmtM(receipt.sale.cashAmount)}</div>
          <div>{receipt.sale.pay2}: {fmtM(receipt.sale.cash2)}</div>
        </div>}
        {receipt.ptsE>0&&<div style={{borderTop:"1px dashed #000",marginTop:6,paddingTop:6,fontSize:10,color:"#000",textAlign:"center"}}>Puntos acreditados: +{receipt.ptsE} pts</div>}
        {receipt.ptsE>0&&(receipt.sale.pay==="tarjeta"||receipt.sale.pay==="QR"||(receipt.sale.pay&&receipt.sale.pay.includes("+")))&&<div style={{borderTop:"1px dashed #000",marginTop:6,paddingTop:8,fontSize:10,color:"#000",textAlign:"center"}}>
          <div style={{fontWeight:900,fontSize:12}}>* La proxima paga en efectivo!</div>
          <div style={{marginTop:3}}>Hubieras sumado +{receipt.ptsE} pts extra pagando en efectivo</div>
        </div>}
        <div style={{borderTop:"1px dashed #000",marginTop:8,paddingTop:8,textAlign:"center"}}>
          {receipt.clientPts!=null&&<div style={{fontSize:10,fontWeight:700,color:"#000",marginBottom:6}}>Puntos acumulados: {receipt.clientPts} pts</div>}
          <div style={{fontSize:9,color:"#000",lineHeight:1.5}}>Estimado cliente, cualquier sugerencia o queja puede comunicarse al <strong>2236786886</strong></div>
          <div style={{fontSize:12,fontWeight:900,color:"#000",marginTop:6}}>¡Muchas gracias por su compra!</div>
        </div>
      </div>
      <Card sx={{padding:28,textAlign:"center"}} className="no-print">
        <div style={{fontSize:44,marginBottom:12}}>✅</div>
        <div style={{fontSize:18,fontWeight:800,color:"#ffffff",marginBottom:4}}>¡Venta Cobrada!</div>
        <div style={{fontSize:12,color:"#ffffff",marginBottom:18,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>{receipt.clientName} <Chip t={receipt.sale.pay}/></div>
        <div style={{background:"#040c16",borderRadius:9,padding:"14px 16px",marginBottom:14,textAlign:"left"}}>
          {receipt.sale.items.map((it,i)=>(<div key={i} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid #192a3818",fontSize:12}}><div><span style={{color:"#ffffff"}}>{it.name}</span><div style={{fontSize:9,color:"#ffffff"}}>{it.unitDisplay}</div></div><span style={{color:"#00cc55",fontWeight:700}}>{fmtM(it.sub)}</span></div>))}
          {receipt.sale.disc>0&&<div style={{display:"flex",justifyContent:"space-between",padding:"5px 0",fontSize:12,color:"#ff9900"}}><span>Desc. puntos</span><span>−{fmtM(receipt.sale.disc)}</span></div>}
          <div style={{display:"flex",justifyContent:"space-between",paddingTop:10,fontWeight:800,fontSize:15,borderTop:"1px solid #192a38"}}><span style={{color:"#ffffff"}}>TOTAL</span><span style={{color:"#00cc55"}}>{fmtM(receipt.sale.total)}</span></div>
          {receipt.sale.cashAmount&&<div style={{marginTop:6,paddingTop:6,borderTop:"1px solid #192a3820",fontSize:11}}>
            <div style={{display:"flex",justifyContent:"space-between"}}><span style={{color:"#ffffff"}}>Efectivo</span><span style={{color:"#00cc55",fontWeight:700}}>{fmtM(receipt.sale.cashAmount)}</span></div>
            <div style={{display:"flex",justifyContent:"space-between"}}><span style={{color:"#ffffff"}}>{receipt.sale.pay2}</span><span style={{color:"#3388ff",fontWeight:700}}>{fmtM(receipt.sale.cash2)}</span></div>
          </div>}
        </div>
        {receipt.ptsE>0&&<div style={{marginBottom:16}}>
          <div style={{fontSize:13,color:"#ff9900",display:"flex",alignItems:"center",gap:6,justifyContent:"center",fontWeight:800}}>
            <Ic n="star" s={15} c="#ff9900"/>+{receipt.ptsE} pts acreditados
          </div>
          {receipt.sale.pay==="efectivo"&&<div style={{marginTop:8,background:"#140800",border:"1px solid #ff990055",borderRadius:8,padding:"8px 14px",textAlign:"center"}}>
            <div style={{fontSize:11,color:"#ff9900",fontWeight:700,display:"flex",alignItems:"center",gap:6,justifyContent:"center"}}>
              <span style={{fontSize:14}}>★</span> ¡Pagando en efectivo sumás el doble de puntos!
            </div>
            <div style={{fontSize:9,color:"#cc7700",marginTop:3}}>Próxima compra podés canjear {fmtM((receipt.ptsE*0.5))} en descuento</div>
          </div>}
          {(receipt.sale.pay==="tarjeta"||receipt.sale.pay==="QR")&&<div style={{marginTop:10,background:"#0a0500",border:"2px solid #ff990088",borderRadius:10,padding:"12px 16px",textAlign:"center",boxShadow:"0 0 18px #ff990033"}}>
            <div style={{fontSize:16,marginBottom:4}}>💡</div>
            <div style={{fontSize:13,color:"#ffbb00",fontWeight:800,marginBottom:4}}>¡La próxima pagá en efectivo!</div>
            <div style={{fontSize:11,color:"#ff9900",fontWeight:600,marginBottom:6}}>Hubieras sumado <strong style={{fontSize:14,color:"#ffdd00"}}>+{receipt.ptsE} pts extra</strong> pagando en efectivo</div>
            <div style={{background:"#1a0a00",borderRadius:7,padding:"6px 10px",fontSize:10,color:"#cc7700"}}>
              💰 Efectivo = <span style={{color:"#ffbb00",fontWeight:800}}>puntos x2</span> · ¡El doble de beneficios!
            </div>
          </div>}
        </div>}
        <div style={{display:"flex",gap:9}}>
          <Btn v="cy" sx={{flex:1,justifyContent:"center",fontSize:12}} onClick={printReceipt}><Ic n="prt" s={14}/>Imprimir Recibo</Btn>
          <Btn v="g" sx={{flex:1,justifyContent:"center",fontSize:12}} onClick={()=>{setCart([]);setCid("");setCliQ("");setPay("");setPay2("");setMixedMode(false);setCashAmount("");setDate(todayStr());setQ("");setCatF("Todas");setExpandedId(null);setUsePts(false);setPtsIn(0);setReceipt(null);}}><Ic n="plus" s={14}/>Nueva Venta</Btn>
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
              <Inp placeholder="Buscar..." value={cliQ} onChange={(e)=>{setCliQ(e.target.value);setCid("");setShowCliList(true);}} onFocus={()=>setShowCliList(true)} sx={{paddingLeft:34,color:"#ffffff",border:"2px solid #ff2222"}}/>
              <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",opacity:.7}}><Ic n="srch" s={13}/></span>
            </div>
            {showCliList&&cliQ&&filteredClients.length>0&&(
              <div style={{position:"absolute",top:"100%",left:0,right:0,background:"#060f1a",border:"1px solid #192a38",borderRadius:7,zIndex:100,maxHeight:200,overflowY:"auto",boxShadow:"0 12px 32px rgba(0,0,0,.7)"}}>
                {filteredClients.map((c)=>(<div key={c.id} onClick={()=>selectClient(c)} style={{padding:"9px 13px",cursor:"pointer",borderBottom:"1px solid #192a3820",fontSize:12}} onMouseEnter={(e)=>e.currentTarget.style.background="#0b1825"} onMouseLeave={(e)=>e.currentTarget.style.background="transparent"}><div style={{fontWeight:700,color:"#ffffff"}}>{c.name}</div><div style={{fontSize:10,color:"#ffffff"}}>DNI:{c.dni} · {c.pts}pts</div></div>))}
              </div>
            )}
            {cid&&client&&<div style={{fontSize:10,color:"#00cc55",marginTop:3}}>✓ {client.name} · {client.pts} pts</div>}
          </div>
          <div>
            <Lbl t="Pago"/>
            <div style={{display:"flex",gap:5,marginBottom:5}}>
              <Sel value={pay} onChange={(e)=>{setPay(e.target.value);if(e.target.value!=="efectivo"){setMixedMode(false);setCashAmount("");}}} sx={{flex:1,border:"2px solid #ff2222"}}>
                <option value="" disabled>— Seleccioná —</option>
                {PAY_OPTS.map(m=><option key={m}>{m}</option>)}
              </Sel>
              {pay==="efectivo"&&<button onClick={()=>{setMixedMode(!mixedMode);setCashAmount("");setPay2("");}} style={{background:mixedMode?"#082244":"transparent",border:`1px solid ${mixedMode?"#3388ff":"#192a38"}`,color:mixedMode?"#3388ff":"#2a3d50",borderRadius:6,padding:"0 8px",cursor:"pointer",fontFamily:"inherit",fontSize:9,fontWeight:700,whiteSpace:"nowrap"}}>+ 2do medio</button>}
            </div>
            {mixedMode&&pay==="efectivo"&&<div style={{display:"flex",gap:5,marginBottom:4}}>
              <Sel value={pay2} onChange={(e)=>setPay2(e.target.value)} sx={{flex:1,fontSize:11}}>
                <option value="" disabled>2do medio...</option>
                {PAY_OPTS.filter(m=>m!=="efectivo").map(m=><option key={m}>{m}</option>)}
              </Sel>
              <Inp type="number" placeholder="$ efectivo" value={cashAmount} onChange={(e)=>setCashAmount(e.target.value)} sx={{width:90,fontSize:11}}/>
            </div>}
            {mixedMode&&cashAmount&&pay2&&total>0&&<div style={{fontSize:9,color:"#3388ff",marginBottom:3}}>Efectivo: {fmtM(parseFloat(cashAmount||"0"))} · {pay2}: {fmtM(Math.max(0,total-parseFloat(cashAmount||"0")))}</div>}
            {!pay&&<div style={{fontSize:9,color:"#ff6666",marginTop:3}}>Requerido</div>}
            {hasEfectivo&&<div style={{fontSize:9,color:"#ff9900",marginTop:2,display:"flex",alignItems:"center",gap:4}}><Ic n="star" s={10} c="#ff9900"/>Puntos x2 por efectivo</div>}
          </div>
          <div><Lbl t="Fecha"/><Inp type="date" value={date} onChange={(e)=>setDate(e.target.value)}/></div>
        </div>
        <div style={{display:"flex",gap:9,marginBottom:10}}>
          <div style={{flex:1,position:"relative"}}>
            <Inp placeholder="Buscar por nombre o código..." value={q} onChange={(e)=>setQ(e.target.value)} sx={{paddingLeft:34,color:"#ffffff",border:"2px solid #ff2222"}}/>
            <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",opacity:.7}}><Ic n="srch" s={13}/></span>
          </div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{["Todas",...CATEGORIES].map(c=>{const[,,tx,em]=CAT_STYLE[c]||["","","#6a8090",""];const active=catF===c;const isTodas=c==="Todas";return<button key={c} onClick={()=>setCatF(c)} style={{background:active?(isTodas?"#ffffff":"#0b1825"):"transparent",border:`2px solid ${active?(isTodas?"#ffffff":tx):(isTodas?"#8ab4c8":"#4a6070")}`,color:active?(isTodas?"#030810":tx):"#ffffff",borderRadius:7,padding:"6px 10px",cursor:"pointer",fontFamily:"inherit",fontSize:10,fontWeight:800,transition:"all .15s"}}>{em?`${em} ${c}`:c}</button>;})}</div>
        </div>
        <Card sx={{overflow:"hidden"}}>
          {visible.length===0&&<div style={{padding:20,color:"#ffffff",textAlign:"center",fontSize:12}}>No hay productos</div>}
          {visible.map((p)=>{
            const[,,,catEm]=CAT_STYLE[p.cat]||["","","#fff",""];
            const expanded=expandedId===p.id;
            return(
              <div key={p.id} style={{borderBottom:"1px solid #192a3820"}}>
                <div onClick={()=>setExpandedId(expanded?null:p.id)} style={{display:"flex",alignItems:"center",padding:"10px 14px",cursor:"pointer",background:expanded?"#051626":"transparent",transition:"background .15s"}}
                  onMouseEnter={(e)=>{if(!expanded)e.currentTarget.style.background="#06111e"}}
                  onMouseLeave={(e)=>{if(!expanded)e.currentTarget.style.background="transparent"}}>
                  <div style={{flex:1,display:"flex",alignItems:"center",gap:10}}>
                    <div style={{fontSize:18,lineHeight:1}}>{catEm}</div>
                    <div>
                      <div style={{fontSize:12,fontWeight:700,color:"#ffffff"}}>{p.name}{p.code&&<span style={{marginLeft:8,fontFamily:"monospace",fontSize:10,color:"#ffffff",fontWeight:400}}>#{p.code}</span>}</div>
                      <div style={{fontSize:11,color:"#ffffff",marginTop:1}}>{p.cat} · <span style={{color:"#00cc55",fontWeight:800,fontSize:14}}>{p.unit==="kg"?`$${p.pricePerKg}/kg`:`$${p.unitPrice}/u`}</span>{p.unit==="kg"&&p.bulkWeight>0&&<span style={{color:"#ff2222",fontWeight:700,fontSize:13,marginLeft:8}}>| Bulto: ${p.bulkPrice} · {fmtW(p.bulkWeight)}</span>}</div>
                    </div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    {isAdmin&&<span style={{fontSize:11,fontWeight:700,color:p.stk<0?"#ff4444":p.stk<=p.min?"#ff9900":"#2a3d50"}}>{p.unit==="kg"?fmtW(p.stk):`${p.stk} u`}</span>}
                    <div style={{transform:expanded?"rotate(180deg)":"rotate(0deg)",transition:"transform .2s",color:"#ffffff"}}><Ic n="chev" s={14}/></div>
                  </div>
                </div>
                {expanded&&<div style={{padding:"10px 14px 14px",background:"#040c16",borderTop:"1px solid #192a3820"}}>
                  <ProdCardInline p={p} onAdd={(prod,type,val)=>{addToCart(prod,type,val);}}/>
                </div>}
              </div>
            );
          })}
        </Card>
      </div>
      <Card sx={{display:"flex",flexDirection:"column",overflow:"hidden",position:"sticky",top:0,maxHeight:"calc(100vh - 44px)"}}>
        <div style={{padding:"13px 15px",borderBottom:"1px solid #192a38",flexShrink:0}}>
          <div style={{fontSize:8,fontWeight:700,letterSpacing:2.5,color:"#ffffff",textTransform:"uppercase",marginBottom:4}}>Carrito · {cart.length} ítems</div>
          <div style={{fontSize:24,fontWeight:800,color:"#00cc55"}}>{fmtM(total)}</div>
          {disc>0&&<div style={{fontSize:10,color:"#ff9900",marginTop:2}}>−{fmtM(disc)} desc.</div>}
        </div>
        <div style={{flex:1,overflow:"auto"}}>
          {!cart.length&&<div style={{padding:22,color:"#ffffff",textAlign:"center",fontSize:11}}>Seleccioná productos</div>}
          {cart.map((it)=>(<div key={it.key} style={{padding:"8px 13px",borderBottom:"1px solid #192a3814",display:"flex",justifyContent:"space-between",alignItems:"center",gap:7}}><div style={{flex:1,minWidth:0}}><div style={{fontSize:11,fontWeight:700,color:"#ffffff",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{it.name}</div><div style={{display:"flex",gap:5,marginTop:2}}><Chip t={it.type}/><span style={{fontSize:9,color:"#ffffff"}}>{it.type==="unidad"?`${it.qty} u`:it.unitDisplay}</span></div></div><div style={{display:"flex",alignItems:"center",gap:5,flexShrink:0}}><span style={{fontWeight:800,color:"#00cc55",fontSize:12}}>{fmtM(it.sub)}</span><button onClick={()=>setCart((p)=>p.filter((i)=>i.key!==it.key))} style={{background:"none",border:"none",color:"#ff4444",cursor:"pointer",fontSize:18,padding:0,lineHeight:1}}>×</button></div></div>))}
        </div>
        {client&&client.pts>0&&(
          <div style={{padding:"9px 13px",borderTop:"1px solid #192a38",background:"#030e06",flexShrink:0}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
              <div style={{display:"flex",alignItems:"center",gap:5}}><Ic n="star" s={12} c="#ff9900"/><span style={{fontSize:11,color:"#ff9900",fontWeight:700}}>{client.pts} pts</span></div>
              <label style={{display:"flex",alignItems:"center",gap:5,cursor:"pointer"}}><input type="checkbox" checked={usePts} onChange={(e)=>{setUsePts(e.target.checked);if(!e.target.checked)setPtsIn(0);}} style={{accentColor:"#ff9900"}}/><span style={{fontSize:10,color:"#ffffff"}}>Canjear</span></label>
            </div>
            {usePts&&<div style={{display:"flex",gap:7,alignItems:"center"}}><Inp type="number" min={0} max={client.pts} value={ptsIn} onChange={(e)=>setPtsIn(Math.min(parseInt(e.target.value)||0,client.pts))} sx={{width:72}}/><span style={{fontSize:9,color:"#ffffff"}}>= {fmtM((Math.min(parseInt(String(ptsIn))||0,client.pts)*POINT_VALUE))}</span></div>}
          </div>
        )}
        {client&&<div style={{padding:"5px 13px",background:"#02090e",flexShrink:0,fontSize:9,color:"#ffffff",display:"flex",justifyContent:"space-between"}}><span>Genera:</span><span style={{color:"#ff9900",fontWeight:700}}>+{ptsE} pts{pay==="efectivo"&&<span style={{color:"#ffbb00"}}> ★x2</span>}</span></div>}
        <div style={{padding:"11px 13px",borderTop:"1px solid #192a38",flexShrink:0}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:4}}><span style={{color:"#ffffff"}}>Subtotal</span><span>{fmtM(sub)}</span></div>
          {disc>0&&<div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:4,color:"#ff9900"}}><span>Desc.</span><span>−{fmtM(disc)}</span></div>}
          <div style={{display:"flex",justifyContent:"space-between",fontWeight:800,fontSize:14,marginBottom:12}}><span style={{color:"#ffffff"}}>TOTAL</span><span style={{color:"#00cc55"}}>{fmtM(total)}</span></div>
          <Btn v="g" sx={{width:"100%",justifyContent:"center",fontSize:12}} onClick={confirm} disabled={saving}>
            {saving?<><Ic n="spin" s={13}/>Guardando...</>:<><Ic n="ok" s={13}/>Confirmar y Cobrar</>}
          </Btn>
        </div>
      </Card>
    </div>
  );
}

function ProdCardInline({p,onAdd}) {
  const isKg=p.unit==="kg";
  const[granelMonto,setGranelMonto]=useState("");
  const[granelKg,setGranelKg]=useState("");
  const[bultoQty,setBultoQty]=useState(1);
  const[unitQty,setUnitQty]=useState(1);
  const kgPorMonto=isKg&&p.pricePerKg>0&&granelMonto?parseFloat(granelMonto)/p.pricePerKg:0;
  const montoPorKg=isKg&&p.pricePerKg>0&&granelKg?parseFloat(granelKg)*p.pricePerKg:0;

  const handleAddPesos=()=>{
    const val=parseFloat(granelMonto);
    if(!val||val<=0) return;
    onAdd(p,"granel",val);
    setGranelMonto("");
  };
  const handleAddKg=(kg)=>{
    onAdd(p,"granel_kg",kg);
    setGranelKg("");
  };

  return(
    <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
      {isKg&&<>
        <div style={{background:"#020e06",border:"1px solid #00882220",borderRadius:7,padding:"10px 12px",flex:1,minWidth:200}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:10,alignItems:"center"}}>
            <Chip t="granel"/><span style={{color:"#00cc55",fontWeight:700,fontSize:10}}>{fmtM(p.pricePerKg)}/kg</span>
          </div>

          {/* PESOS */}
          <div style={{marginBottom:10}}>
            <div style={{fontSize:8,fontWeight:700,letterSpacing:1.5,color:"#ffffff",textTransform:"uppercase",marginBottom:5}}>$ Pesos</div>
            {kgPorMonto>0&&<div style={{background:"#060f1a",borderRadius:5,padding:"2px 8px",marginBottom:5,fontSize:10,color:"#00cc55",fontWeight:700}}>${granelMonto} = {fmtW(kgPorMonto)}</div>}
            <div style={{display:"flex",gap:6,alignItems:"center"}}>
              <div style={{position:"relative",flex:1}}>
                <span style={{position:"absolute",left:8,top:"50%",transform:"translateY(-50%)",fontSize:11,color:"#ffffff",fontWeight:700,pointerEvents:"none"}}>$</span>
                <input type="number" min="1" placeholder="Importe..." value={granelMonto}
                  onChange={(e)=>setGranelMonto(e.target.value)}
                  onKeyDown={(e)=>e.key==="Enter"&&handleAddPesos()}
                  style={{width:"100%",fontSize:13,background:"#060f1a",border:"1px solid #192a38",color:"#ffffff",padding:"7px 8px 7px 20px",borderRadius:6,fontFamily:"inherit",outline:"none",boxSizing:"border-box"}}/>
              </div>
              <Btn v="g" sx={{padding:"6px 12px",fontSize:9,flexShrink:0}} onClick={handleAddPesos} disabled={!granelMonto}>+ Ag.</Btn>
            </div>
          </div>

          {/* Divisor */}
          <div style={{height:1,background:"#192a38",marginBottom:10}}/>

          {/* KG */}
          <div>
            <div style={{fontSize:8,fontWeight:700,letterSpacing:1.5,color:"#ffffff",textTransform:"uppercase",marginBottom:5}}>Kilogramos</div>
            {montoPorKg>0&&<div style={{background:"#060f1a",borderRadius:5,padding:"2px 8px",marginBottom:5,fontSize:10,color:"#00d4ff",fontWeight:700}}>{fmtW(parseFloat(granelKg)||0)} = {fmtM(montoPorKg)}</div>}
            {/* Botones rápidos */}
            <div style={{display:"flex",gap:5,marginBottom:7}}>
              {[0.5,1,2].map(kg=>(
                <button key={kg} onClick={()=>handleAddKg(kg)}
                  style={{flex:1,padding:"7px 4px",borderRadius:6,border:"1px solid #00d4ff44",background:"#021520",color:"#00d4ff",cursor:"pointer",fontFamily:"inherit",fontSize:11,fontWeight:800,transition:"all .15s"}}
                  onMouseEnter={(e)=>{e.currentTarget.style.background="#032a30";e.currentTarget.style.borderColor="#00d4ff"}}
                  onMouseLeave={(e)=>{e.currentTarget.style.background="#021520";e.currentTarget.style.borderColor="#00d4ff44"}}>
                  {kg===0.5?"½ kg":`${kg} kg`}
                </button>
              ))}
            </div>
            {/* Campo libre */}
            <div style={{display:"flex",gap:6,alignItems:"center"}}>
              <input type="number" min="0.1" step="0.1" placeholder="Otro kg..." value={granelKg}
                onChange={(e)=>setGranelKg(e.target.value)}
                onKeyDown={(e)=>e.key==="Enter"&&granelKg&&handleAddKg(parseFloat(granelKg))}
                style={{flex:1,fontSize:12,background:"#060f1a",border:"1px solid #192a38",color:"#ffffff",padding:"6px 8px",borderRadius:6,fontFamily:"inherit",outline:"none"}}/>
              <span style={{fontSize:9,color:"#ffffff",flexShrink:0}}>kg</span>
              <Btn v="cy" sx={{padding:"6px 10px",fontSize:9,flexShrink:0}} onClick={()=>granelKg&&handleAddKg(parseFloat(granelKg))} disabled={!granelKg}>+ Ag.</Btn>
            </div>
          </div>
        </div>

        {p.bulkWeight>0&&<div style={{background:"#02060e",border:"1px solid #2266ee20",borderRadius:7,padding:"8px 10px",minWidth:160,flex:"0 0 auto"}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:4,alignItems:"center"}}><Chip t="bulto"/><span style={{color:"#ff2222",fontWeight:700,fontSize:10}}>${p.bulkPrice} · {fmtW(p.bulkWeight)}</span></div>
          <div style={{display:"flex",gap:5,alignItems:"center"}}><input type="number" min="1" value={bultoQty} onChange={(e)=>setBultoQty(e.target.value)} style={{width:52,background:"#030810",border:"1px solid #192a38",color:"#ffffff",padding:"4px 7px",borderRadius:5,fontFamily:"inherit",fontSize:11,outline:"none"}}/><span style={{fontSize:9,color:"#ffffff"}}>bultos</span><Btn v="b" sx={{flex:1,justifyContent:"center",fontSize:9,padding:"4px 6px"}} onClick={()=>onAdd(p,"bulto",parseInt(String(bultoQty))||1)}>+ Ag.</Btn></div>
        </div>}
      </>}
      {!isKg&&<div style={{background:"#080310",border:"1px solid #aa44ff20",borderRadius:7,padding:"8px 10px",minWidth:180,flex:1}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:4,alignItems:"center"}}><Chip t="unidad"/><span style={{color:"#cc44ff",fontWeight:700,fontSize:10}}>{fmtM((p.unitPrice||0))}/u</span></div>
        <div style={{display:"flex",gap:5,alignItems:"center"}}><input type="number" min="1" value={unitQty} onChange={(e)=>setUnitQty(e.target.value)} style={{width:52,background:"#030810",border:"1px solid #192a38",color:"#ffffff",padding:"4px 7px",borderRadius:5,fontFamily:"inherit",fontSize:11,outline:"none"}}/><span style={{fontSize:9,color:"#ffffff"}}>u</span><Btn v="pu" sx={{flex:1,justifyContent:"center",fontSize:9,padding:"4px 6px"}} onClick={()=>onAdd(p,"unidad",parseInt(String(unitQty))||1)}>+ Ag.</Btn></div>
      </div>}
    </div>
  );
}

function History({sales,clients,users,isAdmin,notify,loadAll,session}) {
  const[q,setQ]=useState("");const[pf,setPf]=useState("todos");const[vendF,setVendF]=useState("todos");const[localF,setLocalF]=useState("todos");const[det,setDet]=useState(null);const[confirmDel,setConfirmDel]=useState(null);
  const loginAt=session?.loginAt?new Date(session.loginAt):null;
  const mySales=isAdmin?sales:sales.filter((s)=>{
    if(s.uid!==session?.id) return false;
    if(s.date!==todayStr()) return false;
    return true;
  });
  // Unique vendors and locals for filters
  const vendorOptions=[...new Map(mySales.map(s=>{const u=users.find(u=>u.id===s.uid);return[s.uid,{id:s.uid,name:u?.name||"—"}];}).filter(([,u])=>u.name!=="—")).values()];
  const localOptions=[...new Set(mySales.map(s=>s.localName).filter(Boolean))];
  const vis=mySales.filter((s)=>{
    const cl=clients.find((c)=>c.id===s.cid);
    const matchQ=!q||cl?.name.toLowerCase().includes(q.toLowerCase());
    const matchPay=pf==="todos"||s.pay===pf;
    const matchVend=vendF==="todos"||String(s.uid)===vendF;
    const matchLocal=localF==="todos"||s.localName===localF;
    return matchQ&&matchPay&&matchVend&&matchLocal;
  });
  const delSale=async(id)=>{await sb.from("gp_sales").delete().eq("id",id);notify("Venta eliminada");setConfirmDel(null);loadAll();};
  return(
    <div className="fade">
      <div style={{marginBottom:16}}><h1 style={{fontSize:18,fontWeight:800,margin:0}}>Ventas</h1><p style={{color:"#ffffff",fontSize:9,margin:"3px 0 0",letterSpacing:2.5}}>{mySales.length} REGISTROS{!isAdmin&&" · MIS VENTAS"}</p></div>
      <div style={{display:"flex",gap:9,marginBottom:12,flexWrap:"wrap"}}>
        <div style={{flex:1,position:"relative",minWidth:160}}><Inp placeholder="Buscar cliente..." value={q} onChange={(e)=>setQ(e.target.value)} sx={{paddingLeft:34}}/><span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",opacity:.5}}><Ic n="srch" s={13}/></span></div>
        <Sel value={pf} onChange={(e)=>setPf(e.target.value)} sx={{width:130}}><option value="todos">Todos los pagos</option>{PAY_OPTS.map(m=><option key={m}>{m}</option>)}</Sel>
        {isAdmin&&<Sel value={vendF} onChange={(e)=>setVendF(e.target.value)} sx={{width:140}}><option value="todos">👤 Vendedor</option>{vendorOptions.map(u=><option key={u.id} value={String(u.id)}>{u.name}</option>)}</Sel>}
        {isAdmin&&<Sel value={localF} onChange={(e)=>setLocalF(e.target.value)} sx={{width:130}}><option value="todos">📍 Local</option>{localOptions.map(l=><option key={l} value={l}>{l}</option>)}</Sel>}
        {isAdmin&&(vendF!=="todos"||localF!=="todos"||pf!=="todos")&&<Btn v="gh" sx={{padding:"6px 10px",fontSize:9}} onClick={()=>{setVendF("todos");setLocalF("todos");setPf("todos");}}>Limpiar</Btn>}
      </div>
      <Card sx={{overflow:"hidden"}}><table><thead><tr><th>#</th><th>Fecha</th><th>Cliente</th><th>Total</th><th>Pago</th><th>Pts</th><th>Vendedor</th><th>Local</th><th></th></tr></thead>
        <tbody>{vis.map((s)=>{const cl=clients.find((c)=>c.id===s.cid);const us=users.find((u)=>u.id===s.uid);const saleTime=new Date(s.id).toString()!=="Invalid Date"?new Date(s.id).toLocaleTimeString("es-AR",{hour:"2-digit",minute:"2-digit",hour12:false}):"";return(<tr key={s.id}><td style={{color:"#ffffff",fontSize:9,fontFamily:"monospace"}}>#{String(s.id).slice(-6)}</td><td style={{color:"#ffffff"}}>{s.date}{saleTime&&<div style={{fontSize:9,color:"#00d4ff"}}>{saleTime}</div>}</td><td style={{fontWeight:700,color:"#ffffff"}}>{cl?.name||"—"}</td><td style={{fontWeight:800,color:"#00cc55",fontSize:13}}>{fmtM(s.total)}</td><td><Chip t={s.pay}/></td><td style={{color:"#ff9900",fontWeight:700}}>{s.ptsE>0?`+${s.ptsE}`:"-"}</td><td style={{color:"#ffffff",fontSize:11}}>{us?.name||"—"}</td><td style={{color:"#00d4ff",fontSize:11}}>{s.localName||"—"}</td>
          <td><div style={{display:"flex",gap:4}}>
            <Btn v="gh" sx={{padding:"3px 6px",fontSize:9}} onClick={()=>setDet(s)}><Ic n="eye" s={11}/></Btn>
            {isAdmin&&<Btn v="r" sx={{padding:"3px 6px",fontSize:9}} onClick={()=>setConfirmDel(s)}><Ic n="del" s={11}/></Btn>}
          </div></td>
        </tr>);})}</tbody>
      </table></Card>
      {det&&(<Modal close={()=>setDet(null)} w={440}><div style={{padding:22}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:14}}><h2 style={{margin:0,fontSize:15,fontWeight:800}}>Detalle #{String(det.id).slice(-6)}</h2><Btn v="gh" sx={{padding:"3px 8px"}} onClick={()=>setDet(null)}><Ic n="x" s={13}/></Btn></div>
        <div style={{fontSize:10,color:"#ffffff",marginBottom:12}}>{det.date}{new Date(det.id).toString()!=="Invalid Date"&&<span style={{color:"#00d4ff",marginLeft:6}}>{new Date(det.id).toLocaleTimeString("es-AR",{hour:"2-digit",minute:"2-digit",hour12:false})}</span>} · <Chip t={det.pay}/> {det.localName&&<span style={{color:"#00d4ff",marginLeft:6}}>📍{det.localName}</span>}</div>
        {det.items?.map((it,i)=>(<div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid #192a3818",alignItems:"center"}}><div><div style={{fontSize:12,color:"#ffffff",fontWeight:600}}>{it.name}</div><div style={{fontSize:9,color:"#ffffff"}}>{it.unitDisplay}</div></div><span style={{color:"#00cc55",fontWeight:700}}>{fmtM(it.sub)}</span></div>))}
        <div style={{background:"#040c16",borderRadius:8,padding:"11px 13px",marginTop:11}}>{det.disc>0&&<div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:4,color:"#ff9900"}}><span>Desc.</span><span>−{fmtM(det.disc)}</span></div>}<div style={{display:"flex",justifyContent:"space-between",fontWeight:800,fontSize:14}}><span style={{color:"#ffffff"}}>TOTAL</span><span style={{color:"#00cc55"}}>{fmtM(det.total)}</span></div></div>
      </div></Modal>)}
      {confirmDel&&(<Modal close={()=>setConfirmDel(null)} w={380}><div style={{padding:24,textAlign:"center"}}><div style={{fontSize:36,marginBottom:12}}>🗑️</div><h2 style={{margin:"0 0 8px",fontSize:16,fontWeight:800}}>¿Eliminar venta?</h2><p style={{color:"#ffffff",fontSize:13,marginBottom:8}}>Venta <strong style={{color:"#ffffff"}}>#{String(confirmDel.id).slice(-6)}</strong></p><p style={{color:"#ff9900",fontSize:11,marginBottom:20}}>⚠ El stock no se repondrá automáticamente</p><div style={{display:"flex",gap:10,justifyContent:"center"}}><Btn v="gh" onClick={()=>setConfirmDel(null)}>Cancelar</Btn><Btn v="r" onClick={()=>delSale(confirmDel.id)}><Ic n="del" s={13}/>Eliminar</Btn></div></div></Modal>)}
    </div>
  );
}

function Reportes({sales,users,localeNames}) {
  const[tab,setTab]=useState("mensual");
  const[localSel,setLocalSel]=useState("todos");
  const totalGeneral=sales.reduce((a,b)=>a+b.total,0);

  const fmtMonth=(ym)=>{
    const[y,m]=ym.split("-");
    const names=["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
    return`${names[parseInt(m)-1]} ${y}`;
  };

  // Todos los meses únicos ordenados desc — garantizar al menos mes actual + 2 anteriores
  const allSalesMonths=[...new Set(sales.map(s=>s.date?s.date.slice(0,7):"").filter(Boolean))];
  const currentYm=new Date().toISOString().slice(0,7);
  const prev1=new Date(new Date().setMonth(new Date().getMonth()-1)).toISOString().slice(0,7);
  const prev2=new Date(new Date().setMonth(new Date().getMonth()-2)).toISOString().slice(0,7);
  [currentYm,prev1,prev2].forEach(ym=>{ if(!allSalesMonths.includes(ym)) allSalesMonths.push(ym); });
  const allMonths=allSalesMonths.sort((a,b)=>b.localeCompare(a));

  // Por mes y local: { ym -> { localName -> {count, total} } }
  const byMonthLocal=()=>{
    const map={};
    sales.forEach((s)=>{
      const ym=s.date?s.date.slice(0,7):"";
      if(!ym) return;
      if(!map[ym]) map[ym]={};
      const loc=s.localName||"Sin local";
      if(!map[ym][loc]) map[ym][loc]={count:0,total:0};
      map[ym][loc].count++;
      map[ym][loc].total+=s.total;
    });
    return map;
  };
  const monthLocalMap=byMonthLocal();

  // Locales a mostrar según filtro
  const localesVis=localSel==="todos"?[...new Set(sales.map(s=>s.localName||"Sin local"))]:[ localSel ];

  // Para comparativo: total por mes filtrado por local
  const totalByMonth=(ym)=>localesVis.reduce((acc,l)=>acc+(monthLocalMap[ym]?.[l]?.total||0),0);
  const countByMonth=(ym)=>localesVis.reduce((acc,l)=>acc+(monthLocalMap[ym]?.[l]?.count||0),0);
  const maxMonth=allMonths.length>0?Math.max(...allMonths.map(ym=>totalByMonth(ym))):1;

  // Reporte por local
  const byLocal=localeNames.map((l)=>{const ls=sales.filter((s)=>s.localName===l);return{name:l,count:ls.length,total:ls.reduce((a,b)=>a+b.total,0)};});

  // Reporte por usuario
  const byUser=users.map((u)=>{const us=sales.filter((s)=>s.uid===u.id);return{name:u.name,local:u.local,role:u.role,count:us.length,total:us.reduce((a,b)=>a+b.total,0)};}).filter((u)=>u.count>0).sort((a,b)=>b.total-a.total);

  const LOCAL_COLORS=["#00cc55","#3388ff","#cc44ff","#ff9900","#00d4ff","#ff4444"];

  return(
    <div className="fade">
      <div style={{marginBottom:16}}><h1 style={{fontSize:18,fontWeight:800,margin:0}}>Reportes</h1><p style={{color:"#ffffff",fontSize:9,margin:"3px 0 0",letterSpacing:2.5}}>VENTAS TOTALES · {sales.length} OPERACIONES</p></div>
      <Card sx={{padding:"14px 16px",marginBottom:16,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div><div style={{fontSize:9,color:"#ffffff",letterSpacing:2,textTransform:"uppercase",marginBottom:4}}>Total General</div><div style={{fontSize:28,fontWeight:800,color:"#00cc55"}}>{fmtM(totalGeneral)}</div></div>
        <div style={{display:"flex",gap:8}}>
          <Btn v={tab==="mensual"?"cy":"gh"} onClick={()=>setTab("mensual")}><Ic n="trend" s={13}/>Mensual</Btn>
          <Btn v={tab==="local"?"cy":"gh"} onClick={()=>setTab("local")}><Ic n="loc" s={13}/>Por Local</Btn>
          <Btn v={tab==="user"?"cy":"gh"} onClick={()=>setTab("user")}><Ic n="usr" s={13}/>Por Usuario</Btn>
        </div>
      </Card>

      {tab==="mensual"&&(<>
        {/* Filtro por local */}
        <div style={{display:"flex",gap:7,marginBottom:12,flexWrap:"wrap",alignItems:"center"}}>
          <span style={{fontSize:9,color:"#ffffff",letterSpacing:1.5,textTransform:"uppercase",fontWeight:700}}>Filtrar:</span>
          <button onClick={()=>setLocalSel("todos")} style={{background:localSel==="todos"?"#00d4ff":"transparent",border:`1px solid ${localSel==="todos"?"#00d4ff":"#192a38"}`,color:localSel==="todos"?"#030810":"#ffffff",borderRadius:7,padding:"5px 12px",cursor:"pointer",fontFamily:"inherit",fontSize:10,fontWeight:700,transition:"all .15s"}}>Todos</button>
          {localeNames.map((l,i)=><button key={l} onClick={()=>setLocalSel(l)} style={{background:localSel===l?LOCAL_COLORS[i%LOCAL_COLORS.length]:"transparent",border:`1px solid ${localSel===l?LOCAL_COLORS[i%LOCAL_COLORS.length]:"#192a38"}`,color:localSel===l?"#030810":"#ffffff",borderRadius:7,padding:"5px 12px",cursor:"pointer",fontFamily:"inherit",fontSize:10,fontWeight:700,transition:"all .15s"}}>📍 {l}</button>)}
        </div>

        <Card sx={{overflow:"hidden"}}>
          <div style={{padding:"11px 16px",borderBottom:"1px solid #192a38",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:8,fontWeight:700,letterSpacing:2.5,color:"#ffffff",textTransform:"uppercase"}}>Comparativo Mensual {localSel!=="todos"&&`· ${localSel}`}</span>
            {localSel==="todos"&&<span style={{fontSize:9,color:"#ffffff"}}>todos los locales</span>}
          </div>
          {allMonths.length===0&&<div style={{padding:20,color:"#ffffff",textAlign:"center"}}>Sin datos</div>}
          {allMonths.map((ym,i)=>{
            const currentYm=new Date().toISOString().slice(0,7);
            const isCurrentMonth=ym===currentYm;
            const total=totalByMonth(ym);
            const count=countByMonth(ym);
            const prevYm=allMonths[i+1];
            const prevTotal=prevYm?totalByMonth(prevYm):null;
            const diff=prevTotal!=null?total-prevTotal:null;
            const pct=prevTotal!=null&&prevTotal>0?((total-prevTotal)/prevTotal*100):null;
            const barW=maxMonth>0?(total/maxMonth*100):0;
            return(
              <div key={ym} style={{padding:"12px 16px",borderBottom:"1px solid #192a3814"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <span style={{fontSize:13,fontWeight:800,color:isCurrentMonth?"#00d4ff":"#a0bcd0",minWidth:70}}>{fmtMonth(ym)}</span>
                    {isCurrentMonth&&<span style={{fontSize:8,background:"#00d4ff22",color:"#00d4ff",padding:"2px 7px",borderRadius:10,fontWeight:700,letterSpacing:1}}>MES ACTUAL</span>}
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:14}}>
                    {pct!=null&&<span style={{fontSize:10,fontWeight:700,color:diff>=0?"#00cc55":"#ff4444"}}>{diff>=0?"▲":"▼"} {Math.abs(pct).toFixed(1)}% vs mes ant.</span>}
                    <div style={{textAlign:"right"}}>
                      <div style={{fontSize:14,fontWeight:800,color:"#00cc55"}}>{fmtM(total)}</div>
                      <div style={{fontSize:9,color:"#ffffff"}}>{count} ventas</div>
                    </div>
                  </div>
                </div>
                {/* Barra global */}
                <div style={{height:5,background:"#192a38",borderRadius:3,overflow:"hidden",marginBottom:localSel==="todos"?6:0}}>
                  <div style={{height:"100%",background:isCurrentMonth?"#00d4ff":"#00cc55",width:`${barW}%`,borderRadius:3,transition:"width .4s ease"}}/>
                </div>
                {/* Desglose por local cuando es "todos" */}
                {localSel==="todos"&&localeNames.map((l,li)=>{
                  const ld=monthLocalMap[ym]?.[l];
                  if(!ld||ld.total===0) return null;
                  const lBarW=maxMonth>0?(ld.total/maxMonth*100):0;
                  const lColor=LOCAL_COLORS[li%LOCAL_COLORS.length];
                  return(
                    <div key={l} style={{display:"flex",alignItems:"center",gap:8,marginTop:4}}>
                      <span style={{fontSize:9,color:lColor,minWidth:72,fontWeight:600}}>📍 {l}</span>
                      <div style={{flex:1,height:4,background:"#192a38",borderRadius:2,overflow:"hidden"}}>
                        <div style={{height:"100%",background:lColor,width:`${lBarW}%`,borderRadius:2,opacity:.8}}/>
                      </div>
                      <span style={{fontSize:10,fontWeight:700,color:lColor,minWidth:80,textAlign:"right"}}>{fmtM(ld.total)}</span>
                      <span style={{fontSize:9,color:"#ffffff",minWidth:40,textAlign:"right"}}>{ld.count}v</span>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </Card>
      </>)}

      {tab==="local"&&(<Card sx={{overflow:"hidden"}}><div style={{padding:"11px 16px",borderBottom:"1px solid #192a38"}}><span style={{fontSize:8,fontWeight:700,letterSpacing:2.5,color:"#ffffff",textTransform:"uppercase"}}>Ventas por Local</span></div>
        <table><thead><tr><th>Local</th><th>Ventas</th><th>Total</th><th>% del Total</th></tr></thead>
          <tbody>{byLocal.sort((a,b)=>b.total-a.total).map((l)=>(<tr key={l.name}><td style={{fontWeight:700,color:"#ffffff"}}>📍 {l.name}</td><td>{l.count}</td><td style={{fontWeight:800,color:"#00cc55",fontSize:13}}>{fmtM(l.total)}</td><td><div style={{display:"flex",alignItems:"center",gap:8}}><div style={{flex:1,height:6,background:"#192a38",borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",background:"#00cc55",width:`${totalGeneral>0?(l.total/totalGeneral*100):0}%`,borderRadius:3}}/></div><span style={{fontSize:10,color:"#ffffff",minWidth:36}}>{totalGeneral>0?(l.total/totalGeneral*100).toFixed(1):0}%</span></div></td></tr>))}</tbody>
        </table>
      </Card>)}

      {tab==="user"&&(<Card sx={{overflow:"hidden"}}><div style={{padding:"11px 16px",borderBottom:"1px solid #192a38"}}><span style={{fontSize:8,fontWeight:700,letterSpacing:2.5,color:"#ffffff",textTransform:"uppercase"}}>Ventas por Usuario</span></div>
        <table><thead><tr><th>Usuario</th><th>Rol</th><th>Local</th><th>Ventas</th><th>Total</th><th>% del Total</th></tr></thead>
          <tbody>{byUser.map((u,i)=>(<tr key={i}><td style={{fontWeight:700,color:"#ffffff"}}>{u.name}</td><td><Chip t={u.role}/></td><td style={{color:"#00d4ff"}}>{u.local||"—"}</td><td>{u.count}</td><td style={{fontWeight:800,color:"#00cc55",fontSize:13}}>{fmtM(u.total)}</td><td><div style={{display:"flex",alignItems:"center",gap:8}}><div style={{flex:1,height:6,background:"#192a38",borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",background:"#3388ff",width:`${totalGeneral>0?(u.total/totalGeneral*100):0}%`,borderRadius:3}}/></div><span style={{fontSize:10,color:"#ffffff",minWidth:36}}>{totalGeneral>0?(u.total/totalGeneral*100).toFixed(1):0}%</span></div></td></tr>))}</tbody>
        </table>
      </Card>)}
    </div>
  );
}

function StockMgt({prods,notify,localeNames,stockMgt,setStockMgt,session}) {
  const[localF,setLocalF]=useState("");
  const[saving,setSaving]=useState(null);
  const[vals,setVals]=useState({});
  const[minVals,setMinVals]=useState({});
  const[maxVals,setMaxVals]=useState({});
  const[q,setQ]=useState("");
  const[catF,setCatF]=useState("Todas");
  const[soloMinimos,setSoloMinimos]=useState(false);
  const[loading,setLoading]=useState(true);
  const[histProd,setHistProd]=useState(null);
  const[histData,setHistData]=useState([]);
  const[histLoading,setHistLoading]=useState(false);

  const fetchAll=async()=>{
    setLoading(true);
    let all=[];let from=0;const size=1000;
    while(true){
      const{data,error}=await sb.from("gp_stock").select("*").range(from,from+size-1);
      if(error||!data||data.length===0) break;
      all=[...all,...data];
      if(data.length<size) break;
      from+=size;
    }
    setStockMgt(all.map(r=>({id:r.id,productId:r.product_id,localName:r.local_name,stk:Number(r.stk)||0,min:Number(r.min_stk)||0})));
    setLoading(false);
  };

useEffect(()=>{fetchAll();},[]);

  const openHist=async(prod)=>{
    setHistProd(prod);setHistLoading(true);setHistData([]);
    const{data}=await sb.from("gp_stock_mov").select("*").eq("product_id",prod.id).eq("local_name",localF).order("fecha",{ascending:false}).limit(200);
    setHistData(data||[]);setHistLoading(false);
  };

  useEffect(()=>{setVals({});setQ("");setCatF("Todas");},[localF]);

  const saveStk=async(prod)=>{
    const inputVal=vals[prod.id];
    const hasStk=inputVal!==undefined;
    const hasMin=minVals[prod.id]!==undefined;
    const hasMax=maxVals[prod.id]!==undefined;
    if(!hasStk&&!hasMin&&!hasMax){notify("No hay cambios para guardar","err");return;}
    setSaving(prod.id);
    try{
      const{data:rows,error:findErr}=await sb.from("gp_stock").select("id,stk,min_stk,max_stk").eq("product_id",prod.id).eq("local_name",localF);
      if(findErr){notify("Error: "+findErr.message,"err");setSaving(null);return;}
      const realStk=rows&&rows.length>0?Number(rows[0].stk)||0:0;
      const newStk=hasStk?parseFloat(inputVal):0;
      if(hasStk&&isNaN(newStk)){notify("Valor inválido","err");setSaving(null);return;}
      // Ingreso SIEMPRE suma al stock actual
      const finalStk=hasStk?realStk+newStk:realStk;
      const newMin=hasMin?parseFloat(minVals[prod.id])||0:(rows&&rows.length>0?Number(rows[0].min_stk)||0:0);
      const newMax=hasMax?parseFloat(maxVals[prod.id])||0:(rows&&rows.length>0?Number(rows[0].max_stk)||0:0);
      const updatePayload={min_stk:newMin,max_stk:newMax,...(hasStk?{stk:finalStk}:{})};
      if(rows&&rows.length>0){
        await sb.from("gp_stock").update(updatePayload).eq("id",rows[0].id);
      }else{
        await sb.from("gp_stock").insert([{product_id:prod.id,local_name:localF,stk:finalStk,min_stk:newMin,max_stk:newMax}]);
      }
      if(hasStk){
        await sb.from("gp_stock_mov").insert([{id:Date.now(),product_id:prod.id,local_name:localF,tipo:"ingreso",cantidad:newStk,stock_antes:realStk,stock_despues:finalStk,usuario:session?.name||"admin",fecha:new Date().toISOString()}]);
      }
      setStockMgt(prev=>{
        const exists=prev.find(s=>s.productId===prod.id&&s.localName===localF);
        if(exists) return prev.map(s=>s.productId===prod.id&&s.localName===localF?{...s,stk:finalStk,min:newMin,max:newMax}:s);
        return[...prev,{productId:prod.id,localName:localF,stk:finalStk,min:newMin,max:newMax}];
      });
      notify(`✓ ${prod.name} guardado`);
      setVals(v=>({...v,[prod.id]:undefined}));
      setMinVals(v=>({...v,[prod.id]:undefined}));
      setMaxVals(v=>({...v,[prod.id]:undefined}));
    }catch(e){notify("Error: "+e.message,"err");}
    setSaving(null);
  };

  const getStk=(pid)=>{const r=stockMgt.find((s)=>s.productId===pid&&s.localName===localF);return r?r.stk:0;};
  const getMin=(pid)=>{const r=stockMgt.find((s)=>s.productId===pid&&s.localName===localF);return r?r.min:0;};
  const getMax=(pid)=>{const r=stockMgt.find((s)=>s.productId===pid&&s.localName===localF);return r?r.max:0;};

  const filtered=prods.filter((p)=>{
    const matchQ=p.name.toLowerCase().includes(q.toLowerCase())||(p.code&&p.code.toLowerCase().includes(q.toLowerCase()));
    const matchCat=catF==="Todas"||p.cat===catF;
    const matchMin=!soloMinimos||(getMin(p.id)>0&&getStk(p.id)<=getMin(p.id));
    return matchQ&&matchCat&&matchMin;
  });

  const bajosMinimo=prods.filter(p=>getMin(p.id)>0&&getStk(p.id)<=getMin(p.id));

  const exportPedidoPDF=(catPDF="Todas")=>{
    const fecha=new Date().toLocaleDateString("es-AR");
    const lista=prods.filter(p=>{
      const matchCat=catPDF==="Todas"||p.cat===catPDF;
      return matchCat&&getMin(p.id)>0&&getStk(p.id)<=getMin(p.id);
    });
    if(lista.length===0){notify(`No hay productos bajo mínimo${catPDF!=="Todas"?` en ${catPDF}`:""}`,"err");return;}
    const html=`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Pedido ${catPDF} — ${localF}</title>
    <style>
      body{font-family:Arial,sans-serif;padding:20px;color:#000;font-size:12px}
      h1{font-size:18px;margin-bottom:4px;text-align:center}
      .sub{text-align:center;font-size:10px;color:#555;margin-bottom:20px}
      table{width:100%;border-collapse:collapse}
      th{background:#1a1a2e;color:#fff;padding:6px 10px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:1px}
      td{padding:7px 10px;border-bottom:1px solid #eee;font-size:11px}
      tr:nth-child(even) td{background:#fafafa}
      .bajo{color:#cc0000;font-weight:700}
      .apedir{color:#006600;font-weight:900;font-size:13px}
      .checkbox{width:18px;height:18px;border:2px solid #000;display:inline-block;border-radius:2px}
      .footer{margin-top:30px;font-size:9px;color:#888;text-align:center;border-top:1px solid #ccc;padding-top:8px}
      .no-print{text-align:center;margin-bottom:15px}
      @media print{.no-print{display:none}}
    </style></head><body>
    <div class="no-print"><button onclick="window.print()" style="background:#1a1a2e;color:#fff;border:none;padding:8px 20px;border-radius:5px;font-size:13px;cursor:pointer;margin-right:8px">🖨️ Imprimir / PDF</button><button onclick="window.close()" style="background:#666;color:#fff;border:none;padding:8px 14px;border-radius:5px;font-size:13px;cursor:pointer">✕ Cerrar</button></div>
    <h1>🐾 Masc🐾tas Pet Shop</h1>
    <div class="sub">Lista de Pedido · 📍 ${localF}${catPDF!=="Todas"?` · 🗂 ${catPDF}`:""} · ${fecha} · ${lista.length} productos bajo mínimo</div>
    <table><thead><tr><th>✓</th><th>Cód.</th><th>Producto</th><th>Cat.</th><th>Stock actual</th><th>Mínimo</th><th>Máximo</th><th>A pedir</th></tr></thead><tbody>
    ${lista.map(p=>{
      const stk=getStk(p.id);const min=getMin(p.id);const max=getMax(p.id);
      const aPedir=max>0?Math.max(0,max-stk):Math.max(0,min*2-stk);
      const fQ=(n)=>p.unit==="kg"?fmtW(n):`${Math.round(n)} u`;
      return`<tr><td><div class="checkbox"></div></td><td style="font-family:monospace;font-size:10px">${p.code||"—"}</td><td><strong>${p.name}</strong></td><td>${p.cat}</td><td class="bajo">${fQ(stk)}</td><td>${fQ(min)}</td><td>${max>0?fQ(max):"—"}</td><td class="apedir">${fQ(aPedir)}</td></tr>`;
    }).join("")}
    </tbody></table>
    <div class="footer">Masc🐾tas Pet Shop · Generado el ${fecha} · Pedido para ${localF}${catPDF!=="Todas"?` · ${catPDF}`:""}</div>
    </body></html>`;
    const win=window.open("","_blank");
    if(win){win.document.write(html);win.document.close();}
    else notify("Permitir ventanas emergentes para exportar","err");
  };

  return(
    <div className="fade">
      <div style={{marginBottom:16,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div><h1 style={{fontSize:18,fontWeight:800,margin:0}}>Stock por Local</h1><p style={{color:"#ffffff",fontSize:9,margin:"3px 0 0",letterSpacing:2.5}}>ADMINISTRADOR · EDICIÓN LIBRE</p></div>
        <Btn v="gh" onClick={fetchAll} disabled={loading}><Ic n="spin" s={13}/>Actualizar</Btn>
      </div>

      {/* Paso 1: Selección de local */}
      <div style={{marginBottom:16}}>
        <div style={{fontSize:9,fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:"#3d5060",marginBottom:8}}>Seleccioná un local para ajustar stock</div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {localeNames.map((l)=>{
            const active=localF===l;
            return(
              <button key={l} onClick={()=>setLocalF(l)} style={{
                background:active?"#00d4ff":"transparent",
                border:`2px solid ${active?"#00d4ff":"#192a38"}`,
                color:active?"#030810":"#2a3d50",
                borderRadius:9,padding:"10px 20px",cursor:"pointer",
                fontFamily:"inherit",fontSize:12,fontWeight:800,
                transition:"all .15s",
                boxShadow:active?"0 0 18px #00d4ff55":"none",
                transform:active?"scale(1.04)":"scale(1)",
              }}>
                📍 {l}
                {active&&<span style={{marginLeft:7,fontSize:9,background:"#030810",color:"#00d4ff",padding:"2px 7px",borderRadius:10,fontWeight:700,letterSpacing:1}}>AJUSTANDO</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Paso 2: Filtros y tabla — solo si hay local seleccionado */}
      {!localF&&(
        <Card sx={{padding:40,textAlign:"center"}}>
          <div style={{fontSize:32,marginBottom:12}}>📍</div>
          <div style={{fontSize:14,fontWeight:700,color:"#ffffff",marginBottom:6}}>Seleccioná un local</div>
          <div style={{fontSize:11,color:"#ffffff"}}>Elegí el local arriba para ver y editar su stock</div>
        </Card>
      )}

      {localF&&<>
        {/* Banner local activo */}
        <div style={{background:"#00d4ff11",border:"1px solid #00d4ff33",borderRadius:8,padding:"8px 16px",marginBottom:12,display:"flex",alignItems:"center",gap:8}}>
          <Ic n="loc" s={14} c="#00d4ff"/>
          <span style={{fontSize:11,fontWeight:700,color:"#00d4ff"}}>Editando stock de: {localF}</span>
          <span style={{fontSize:9,color:"#ffffff",marginLeft:4}}>{filtered.length} productos</span>
        </div>

        <div style={{display:"flex",gap:9,marginBottom:12,flexWrap:"wrap"}}>
          <div style={{position:"relative",flex:1,minWidth:180}}>
            <Inp placeholder="Buscar por nombre o código..." value={q} onChange={(e)=>setQ(e.target.value)} sx={{paddingLeft:34}}/>
            <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",opacity:.3}}><Ic n="srch" s={13}/></span>
          </div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {["Todas",...CATEGORIES].map(c=>{
              const[,,tx,em]=CAT_STYLE[c]||["","","#6a8090",""];
              const active=catF===c;
              return(
                <button key={c} onClick={()=>setCatF(c)} style={{background:active?"#0b1825":"transparent",border:`1px solid ${active?tx:"#192a38"}`,color:active?tx:"#ffffff",borderRadius:7,padding:"6px 10px",cursor:"pointer",fontFamily:"inherit",fontSize:11,fontWeight:700,transition:"all .15s",display:"flex",alignItems:"center",gap:4}}>
                  {em&&<span style={{fontSize:14}}>{em}</span>}{c==="Todas"?c:""}
                </button>
              );
            })}
          </div>
        </div>

        <Card sx={{overflow:"hidden"}}>
          <div style={{padding:"11px 16px",borderBottom:"1px solid #192a38"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <span style={{fontSize:8,fontWeight:700,letterSpacing:2.5,color:"#ffffff",textTransform:"uppercase"}}>Stock · <span style={{color:"#00d4ff"}}>{localF}</span></span>
              <div style={{display:"flex",gap:7,alignItems:"center",flexWrap:"wrap"}}>
                {bajosMinimo.length>0&&<>
                  <span style={{fontSize:9,color:"#ff4444",fontWeight:700,letterSpacing:1}}>📄 PDF PEDIDO:</span>
                  <Btn v="cy" sx={{padding:"4px 9px",fontSize:9}} onClick={()=>exportPedidoPDF("Todas")}>Todos ({bajosMinimo.length})</Btn>
                  {CATEGORIES.map(cat=>{
                    const n=bajosMinimo.filter(p=>p.cat===cat).length;
                    return n>0?<Btn key={cat} v="gh" sx={{padding:"4px 9px",fontSize:9,border:"1px solid #00d4ff44",color:"#00d4ff"}} onClick={()=>exportPedidoPDF(cat)}>{cat} ({n})</Btn>:null;
                  })}
                </>}
                <span style={{fontSize:10,color:"#00d4ff"}}>{filtered.length} productos</span>
              </div>
            </div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
              <Sel value={catF} onChange={(e)=>setCatF(e.target.value)} sx={{width:120,fontSize:10,padding:"4px 8px"}}>
                <option value="Todas">Todas las cats.</option>
                {CATEGORIES.map(c=><option key={c}>{c}</option>)}
              </Sel>
              <label style={{display:"flex",alignItems:"center",gap:5,cursor:"pointer",background:soloMinimos?"#110305":"transparent",border:`1px solid ${soloMinimos?"#ff444466":"#192a38"}`,borderRadius:6,padding:"4px 10px"}}>
                <input type="checkbox" checked={soloMinimos} onChange={(e)=>setSoloMinimos(e.target.checked)} style={{accentColor:"#ff4444"}}/>
                <span style={{fontSize:10,color:soloMinimos?"#ff4444":"#ffffff",fontWeight:soloMinimos?700:400}}>⚠ Solo bajo mínimo</span>
              </label>
            </div>
          </div>
          {loading?<div style={{padding:20,textAlign:"center",color:"#ffffff"}}>Cargando stock...</div>:
          <table>
            <thead><tr><th>Producto</th><th>Cat.</th><th>Stock Actual</th><th style={{color:"#00cc55"}}>Mín.</th><th style={{color:"#00d4ff"}}>Máx.</th><th style={{color:"#ffcc00"}}>+ Ingreso (suma)</th><th>→ Nuevo Total</th><th></th></tr></thead>
            <tbody>{filtered.map((p)=>{
              const stk=getStk(p.id);
              const min=getMin(p.id);
              const max=getMax(p.id);
              const[,,catTx,catEm]=CAT_STYLE[p.cat]||["","","#fff",""];
              const edited=vals[p.id]!==undefined&&vals[p.id]!=="";
              const inputVal=edited?parseFloat(vals[p.id])||0:0;
              const preview=edited?stk+inputVal:null;
              const bajMin=min>0&&stk<=min;
              return(
                <tr key={p.id} style={{background:bajMin?"#0d0205":"transparent"}}>
                  <td style={{fontWeight:700,color:"#ffffff"}}>{catEm} {p.name}{p.code&&<span style={{marginLeft:6,fontFamily:"monospace",fontSize:10,color:"#00d4ff"}}>#{p.code}</span>}{bajMin&&<span style={{marginLeft:6,fontSize:9,color:"#ff4444",fontWeight:900}}>⚠ BAJO MÍNIMO</span>}</td>
                  <td><span style={{fontSize:9,background:"#192a38",color:catTx,padding:"2px 7px",borderRadius:10,fontWeight:700}}>{p.cat}</span></td>
                  <td><span style={{fontWeight:800,color:bajMin?"#ff4444":stk<0?"#ff6666":"#00cc55"}}>{p.unit==="kg"?fmtW(stk):`${stk} u`}</span></td>
                  <td>
                    <input type="number" step={p.unit==="kg"?".5":"1"} min="0"
                      placeholder={min>0?(p.unit==="kg"?String(min):`${min}`):"mín"}
                      value={minVals[p.id]!==undefined?minVals[p.id]:""}
                      onChange={(e)=>setMinVals(v=>({...v,[p.id]:e.target.value}))}
                      style={{width:64,fontSize:11,background:minVals[p.id]!==undefined?"#021408":"#060f1a",border:`1px solid ${minVals[p.id]!==undefined?"#00882266":"#192a38"}`,color:"#00cc55",padding:"4px 6px",borderRadius:5,fontFamily:"inherit",outline:"none",textAlign:"center"}}/>
                  </td>
                  <td>
                    <input type="number" step={p.unit==="kg"?".5":"1"} min="0"
                      placeholder={max>0?(p.unit==="kg"?String(max):`${max}`):"máx"}
                      value={maxVals[p.id]!==undefined?maxVals[p.id]:""}
                      onChange={(e)=>setMaxVals(v=>({...v,[p.id]:e.target.value}))}
                      style={{width:64,fontSize:11,background:maxVals[p.id]!==undefined?"#021520":"#060f1a",border:`1px solid ${maxVals[p.id]!==undefined?"#00d4ff66":"#192a38"}`,color:"#00d4ff",padding:"4px 6px",borderRadius:5,fontFamily:"inherit",outline:"none",textAlign:"center"}}/>
                  </td>
                  <td>
                    <input type="number" step={p.unit==="kg"?".5":"1"}
                      value={edited?vals[p.id]:0}
                      onChange={(e)=>setVals(v=>({...v,[p.id]:e.target.value}))}
                      onFocus={(e)=>e.target.select()}
                      style={{width:90,fontSize:12,background:edited?"#021408":"#060f1a",border:`1px solid ${edited?"#00cc55":"#192a38"}`,color:"#ffffff",padding:"6px 8px",borderRadius:6,fontFamily:"inherit",outline:"none"}}/>
                  </td>
                  <td>
                    {preview!==null
                      ?<span style={{fontWeight:800,fontSize:12,color:preview<0?"#ff4444":"#00cc55"}}>{p.unit==="kg"?fmtW(preview):`${preview} u`}</span>
                      :<span style={{color:"#ffffff",fontSize:11}}>—</span>}
                  </td>
                  <td>
                    <div style={{display:"flex",gap:5}}>
                      <Btn v="g" sx={{padding:"4px 10px",fontSize:9}} onClick={()=>saveStk(p)} disabled={saving===p.id}>
                        {saving===p.id?<><Ic n="spin" s={11}/>...</>:<><Ic n="ok" s={11}/>Guardar</>}
                      </Btn>
                      <Btn v="gh" sx={{padding:"4px 8px",fontSize:9}} onClick={()=>openHist(p)} title="Ver historial">
                        <Ic n="hist" s={11}/>
                      </Btn>
                    </div>
                  </td>
                </tr>
              );
            })}
            </tbody>
          </table>}
        </Card>
      </>}

      {/* Modal historial de movimientos */}
      {histProd&&<Modal close={()=>setHistProd(null)} w={520}>
        <div style={{padding:22}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <div>
              <h2 style={{margin:0,fontSize:15,fontWeight:800}}>Historial · {histProd.name}</h2>
              <div style={{fontSize:9,color:"#ffffff",marginTop:3,letterSpacing:2}}>📍 {localF} · últimos 200 movimientos</div>
            </div>
            <Btn v="gh" sx={{padding:"3px 8px"}} onClick={()=>setHistProd(null)}><Ic n="x" s={13}/></Btn>
          </div>
          {histLoading&&<div style={{padding:20,textAlign:"center",color:"#ffffff"}}>Cargando...</div>}
          {!histLoading&&histData.length===0&&<div style={{padding:20,textAlign:"center",color:"#ffffff",fontSize:12}}>Sin movimientos registrados aún</div>}
          {!histLoading&&histData.length>0&&<div style={{maxHeight:420,overflowY:"auto"}}>
            <table><thead><tr><th>Fecha</th><th>Tipo</th><th>Cantidad</th><th>Antes</th><th>Después</th><th>Usuario</th></tr></thead>
              <tbody>{histData.map((m,i)=>{
                const isIngreso=m.tipo==="ingreso";
                const fmtQ=histProd.unit==="kg"?fmtW(Math.abs(m.cantidad)):`${Math.abs(m.cantidad)} u`;
                const fmtA=histProd.unit==="kg"?fmtW(m.stock_antes):`${m.stock_antes} u`;
                const fmtD=histProd.unit==="kg"?fmtW(m.stock_despues):`${m.stock_despues} u`;
                return(
                  <tr key={i}>
                    <td style={{fontSize:10,color:"#ffffff"}}>{new Date(m.fecha).toLocaleString("es-AR",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false})}</td>
                    <td><span style={{fontSize:9,fontWeight:700,padding:"2px 8px",borderRadius:10,background:isIngreso?"#021408":"#110305",color:isIngreso?"#00cc55":"#ff5555",border:`1px solid ${isIngreso?"#00882233":"#ff333333"}`}}>{isIngreso?"▲ INGRESO":"▼ VENTA"}</span></td>
                    <td style={{fontWeight:700,color:isIngreso?"#00cc55":"#ff6666"}}>{isIngreso?"+":"-"}{fmtQ}</td>
                    <td style={{color:"#ffffff",fontSize:11}}>{fmtA}</td>
                    <td style={{fontWeight:700,color:Number(m.stock_despues)<0?"#ff4444":"#00cc55",fontSize:11}}>{fmtD}</td>
                    <td style={{color:"#ffffff",fontSize:10}}>{m.usuario||"—"}</td>
                  </tr>
                );
              })}</tbody>
            </table>
          </div>}
        </div>
      </Modal>}
    </div>
  );
}

function LocalMgt({locales,notify,loadAll}) {
  const[modal,setModal]=useState(false);const[form,setForm]=useState(null);const[saving,setSaving]=useState(false);const[confirmDel,setConfirmDel]=useState(null);
  const openNew=()=>{setForm({name:""});setModal(true);};
  const openEdit=(l)=>{setForm({...l});setModal(true);};
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
  const del=async(id)=>{await sb.from("gp_locales").delete().eq("id",id);notify("Local eliminado");setConfirmDel(null);loadAll();};
  return(
    <div className="fade">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}><div><h1 style={{fontSize:18,fontWeight:800,margin:0}}>Locales</h1><p style={{color:"#ffffff",fontSize:9,margin:"3px 0 0",letterSpacing:2.5}}>PUNTOS DE VENTA</p></div><Btn v="g" onClick={openNew}><Ic n="plus" s={13}/>Nuevo Local</Btn></div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:12}}>
        {locales.map((l)=>(<Card key={l.id} sx={{padding:16,display:"flex",justifyContent:"space-between",alignItems:"center"}}><div style={{display:"flex",alignItems:"center",gap:10}}><div style={{fontSize:22}}>📍</div><div style={{fontSize:14,fontWeight:800,color:"#ffffff"}}>{l.name}</div></div><div style={{display:"flex",gap:5}}><Btn v="gh" sx={{padding:"3px 6px",fontSize:9}} onClick={()=>openEdit(l)}><Ic n="edit" s={11}/></Btn><Btn v="r" sx={{padding:"3px 6px",fontSize:9}} onClick={()=>setConfirmDel(l)}><Ic n="del" s={11}/></Btn></div></Card>))}
        {locales.length===0&&<div style={{color:"#ffffff",fontSize:12,padding:20}}>No hay locales. Creá el primero.</div>}
      </div>
      {modal&&form&&(<Modal close={()=>setModal(false)} w={360}><div style={{padding:22}}><h2 style={{margin:"0 0 16px",fontSize:15,fontWeight:800}}>{form.id?"Editar":"Nuevo"} Local</h2><Lbl t="Nombre del Local"/><Inp value={form.name} onChange={(e)=>setForm((f)=>({...f,name:e.target.value}))} placeholder="ej: Sucursal Centro"/><div style={{display:"flex",gap:9,marginTop:16,justifyContent:"flex-end"}}><Btn v="gh" onClick={()=>setModal(false)}>Cancelar</Btn><Btn v="g" onClick={save} disabled={saving}>{saving?"Guardando...":"Guardar"}</Btn></div></div></Modal>)}
      {confirmDel&&(<Modal close={()=>setConfirmDel(null)} w={360}><div style={{padding:24,textAlign:"center"}}><div style={{fontSize:36,marginBottom:12}}>⚠️</div><h2 style={{margin:"0 0 8px",fontSize:16,fontWeight:800}}>¿Eliminar local?</h2><p style={{color:"#ffffff",fontSize:13,marginBottom:20}}><strong style={{color:"#ffffff"}}>{confirmDel.name}</strong></p><div style={{display:"flex",gap:10,justifyContent:"center"}}><Btn v="gh" onClick={()=>setConfirmDel(null)}>Cancelar</Btn><Btn v="r" onClick={()=>del(confirmDel.id)}><Ic n="del" s={13}/>Eliminar</Btn></div></div></Modal>)}
    </div>
  );
}

function Clients({clients,sales,notify,isAdmin,loadAll}) {
  const[modal,setModal]=useState(false);const[form,setForm]=useState(null);const[det,setDet]=useState(null);const[rdm,setRdm]=useState(null);const[rpts,setRpts]=useState(0);const[q,setQ]=useState("");const[confirmDel,setConfirmDel]=useState(null);const[saving,setSaving]=useState(false);
  const openNew=()=>{setForm({name:"",dni:"",phone:"",pts:0,active:true});setModal(true);};
  const openEdit=(c)=>{setForm({...c});setModal(true);};
  const save=async()=>{
    if(!form.name.trim()){notify("Nombre requerido","err");return;}
    if(form.dni&&form.dni.trim()!==""){
      const{data:dup}=await sb.from("gp_clients").select("id,name").eq("dni",form.dni.trim()).neq("id",form.id||0).maybeSingle();
      if(dup){notify(`DNI ya registrado para: ${dup.name}`,"err");return;}
    }
    setSaving(true);
    try{
      if(form.id) await sb.from("gp_clients").update({name:form.name,dni:form.dni,phone:form.phone,pts:form.pts,active:form.active}).eq("id",form.id);
      else await sb.from("gp_clients").insert([{name:form.name,dni:form.dni,phone:form.phone,pts:form.pts||0,active:form.active!==false}]);
      notify(form.id?"Actualizado":"Cliente creado");loadAll();setModal(false);
    }catch(e){notify("Error","err");}
    setSaving(false);
  };
  const doRedeem=async()=>{
    const pts=parseInt(String(rpts))||0;
    if(pts<=0||pts>rdm.pts){notify("Puntos inválidos","err");return;}
    await sb.from("gp_clients").update({pts:rdm.pts-pts}).eq("id",rdm.id);
    notify(`${pts} pts canjeados`);setRdm(null);setRpts(0);loadAll();
  };
  const del=async(id)=>{await sb.from("gp_clients").delete().eq("id",id);notify("Eliminado");setConfirmDel(null);loadAll();};
  const vis=clients.filter((c)=>c.name.toLowerCase().includes(q.toLowerCase())||(c.dni&&c.dni.toLowerCase().includes(q.toLowerCase())));
  return(
    <div className="fade">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}><div><h1 style={{fontSize:18,fontWeight:800,margin:0}}>Clientes</h1><p style={{color:"#ffffff",fontSize:9,margin:"3px 0 0",letterSpacing:2.5}}>{clients.length} REGISTROS</p></div><Btn v="g" onClick={openNew}><Ic n="plus" s={13}/>Nuevo</Btn></div>
      <div style={{position:"relative",marginBottom:12}}><Inp placeholder="Buscar..." value={q} onChange={(e)=>setQ(e.target.value)} sx={{paddingLeft:34}}/><span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",opacity:.3}}><Ic n="srch" s={13}/></span></div>
      <Card sx={{overflow:"hidden"}}><table><thead><tr><th>Nombre</th><th>DNI</th><th>Teléfono</th><th>Compras</th>{isAdmin&&<th>Facturado</th>}<th>Puntos</th><th></th></tr></thead>
        <tbody>{vis.map((c)=>{const cs=sales.filter((s)=>s.cid===c.id);const tf=cs.reduce((a,b)=>a+b.total,0);return(<tr key={c.id}><td style={{fontWeight:700,color:"#ffffff"}}>{c.name}</td><td style={{color:"#ffffff",fontFamily:"monospace",fontSize:10}}>{c.dni||"—"}</td><td style={{color:"#ffffff"}}>{c.phone||"—"}</td><td>{cs.length}</td>{isAdmin&&<td style={{color:"#00cc55",fontWeight:700}}>{fmtM(tf)}</td>}<td><div style={{display:"flex",alignItems:"center",gap:4}}><Ic n="star" s={11} c="#ff9900"/><span style={{fontWeight:800,color:"#ff9900"}}>{c.pts}</span></div></td><td><div style={{display:"flex",gap:4}}><Btn v="gh" sx={{padding:"3px 6px",fontSize:9}} onClick={()=>setDet(c.id)}><Ic n="eye" s={11}/></Btn><Btn v="gh" sx={{padding:"3px 6px",fontSize:9}} onClick={()=>openEdit(c)}><Ic n="edit" s={11}/></Btn><Btn v="or" sx={{padding:"3px 6px",fontSize:9}} onClick={()=>{setRdm(c);setRpts(0);}}><Ic n="gift" s={11}/></Btn>{isAdmin&&<Btn v="r" sx={{padding:"3px 6px",fontSize:9}} onClick={()=>setConfirmDel(c)}><Ic n="del" s={11}/></Btn>}</div></td></tr>);})}</tbody>
      </table></Card>
      {modal&&form&&(<Modal close={()=>setModal(false)}><div style={{padding:22}}><h2 style={{margin:"0 0 16px",fontSize:15,fontWeight:800}}>{form.id?"Editar":"Nuevo"} Cliente</h2><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:11}}><div style={{gridColumn:"1/-1"}}><Lbl t="Nombre"/><Inp value={form.name} onChange={(e)=>setForm((f)=>({...f,name:e.target.value}))} sx={{border:"2px solid #ff2222"}}/></div><div><Lbl t="DNI"/><Inp value={form.dni||""} onChange={(e)=>setForm((f)=>({...f,dni:e.target.value}))} sx={{border:"2px solid #ff2222"}}/></div><div><Lbl t="Teléfono"/><Inp value={form.phone||""} onChange={(e)=>setForm((f)=>({...f,phone:e.target.value}))} sx={{border:"2px solid #ff2222"}}/></div>{form.id&&isAdmin&&<div><Lbl t="Puntos"/><Inp type="number" value={form.pts} onChange={(e)=>setForm((f)=>({...f,pts:parseInt(e.target.value)||0}))} sx={{border:"2px solid #ff2222"}}/></div>}<div style={{display:"flex",alignItems:"center",gap:8}}><input type="checkbox" checked={form.active!==false} onChange={(e)=>setForm((f)=>({...f,active:e.target.checked}))} style={{accentColor:"#00cc55"}}/><span style={{fontSize:12,color:"#ffffff"}}>Activo</span></div></div><div style={{display:"flex",gap:9,marginTop:16,justifyContent:"flex-end"}}><Btn v="gh" onClick={()=>setModal(false)}>Cancelar</Btn><Btn v="g" onClick={save} disabled={saving}>{saving?"Guardando...":"Guardar"}</Btn></div></div></Modal>)}
      {confirmDel&&(<Modal close={()=>setConfirmDel(null)} w={380}><div style={{padding:24,textAlign:"center"}}><div style={{fontSize:36,marginBottom:12}}>⚠️</div><h2 style={{margin:"0 0 8px",fontSize:16,fontWeight:800}}>¿Eliminar?</h2><p style={{color:"#ffffff",fontSize:13,marginBottom:20}}><strong style={{color:"#ffffff"}}>{confirmDel.name}</strong></p><div style={{display:"flex",gap:10,justifyContent:"center"}}><Btn v="gh" onClick={()=>setConfirmDel(null)}>Cancelar</Btn><Btn v="r" onClick={()=>del(confirmDel.id)}><Ic n="del" s={13}/>Eliminar</Btn></div></div></Modal>)}
      {det&&(()=>{const c=clients.find((x)=>x.id===det);const cs=sales.filter((s)=>s.cid===det);const tf=cs.reduce((a,b)=>a+b.total,0);return(<Modal close={()=>setDet(null)} w={460}><div style={{padding:22}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:14}}><h2 style={{margin:0,fontSize:16,fontWeight:800}}>{c?.name}</h2><Btn v="gh" sx={{padding:"3px 8px"}} onClick={()=>setDet(null)}><Ic n="x" s={13}/></Btn></div><div style={{background:"#020e06",border:"1px solid #00882220",borderRadius:9,padding:"12px 14px",marginBottom:13,display:"flex",justifyContent:"space-between"}}><div style={{display:"flex",alignItems:"center",gap:8}}><Ic n="star" s={22} c="#ff9900"/><div><div style={{fontSize:22,fontWeight:800,color:"#ff9900"}}>{c?.pts}</div><div style={{fontSize:8,color:"#ffffff"}}>PUNTOS</div></div></div>{isAdmin&&<div style={{textAlign:"right"}}><div style={{fontSize:13,color:"#00cc55",fontWeight:700}}>{fmtM(tf)}</div><div style={{fontSize:8,color:"#ffffff"}}>total</div></div>}</div><div style={{fontSize:11,color:"#ffffff",marginBottom:8}}>{c?.phone&&<div>📞 {c.phone}</div>}{c?.dni&&<div>DNI: {c.dni}</div>}</div><div style={{maxHeight:200,overflowY:"auto"}}>{cs.map((s)=>(<div key={s.id} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid #192a3814"}}><div><div style={{fontSize:11,color:"#ffffff",fontWeight:600}}>{s.date}</div><Chip t={s.pay}/></div><div style={{textAlign:"right"}}>{isAdmin&&<div style={{fontWeight:800,color:"#00cc55"}}>{fmtM(s.total)}</div>}</div></div>))}</div></div></Modal>);})()}
      {rdm&&(<Modal close={()=>setRdm(null)} w={340}><div style={{padding:22}}><h2 style={{margin:"0 0 14px",fontSize:15,fontWeight:800}}>Canjear — {rdm.name}</h2><div style={{background:"#020e06",border:"1px solid #ff990022",borderRadius:9,padding:14,marginBottom:14,textAlign:"center"}}><div style={{fontSize:30,fontWeight:800,color:"#ff9900"}}>{rdm.pts} pts</div><div style={{fontSize:9,color:"#ffffff"}}>≡ {fmtM((rdm.pts*POINT_VALUE))}</div></div><div style={{marginBottom:13}}><Lbl t="Puntos a canjear"/><Inp type="number" min={0} max={rdm.pts} value={rpts} onChange={(e)=>setRpts(e.target.value)}/></div><div style={{display:"flex",gap:9,justifyContent:"flex-end"}}><Btn v="gh" onClick={()=>setRdm(null)}>Cancelar</Btn><Btn v="or" onClick={doRedeem}><Ic n="gift" s={13}/>Canjear</Btn></div></div></Modal>)}
    </div>
  );
}

function CashClose({sales,caja,notify,session,loadAll,isAdmin,locales,users}) {
  const[closing,setClosing]=useState(false);const[openAmt,setOpenAmt]=useState("");const[retiro,setRetiro]=useState("");const[notes,setNotes]=useState("");const[saving,setSaving]=useState(false);const[confirmDel,setConfirmDel]=useState(null);
  const[filtLocal,setFiltLocal]=useState("todos");
  const[filtUser,setFiltUser]=useState("todos");
  const myCaja=isAdmin?caja:caja.filter((d)=>d.closedBy===session?.id);
  const closedIds=caja.flatMap((d)=>d.saleIds||[]);
  const mySales=isAdmin?sales:sales.filter((s)=>s.uid===session?.id);
  const unclosed=mySales.filter((s)=>!closedIds.includes(s.id));
  const byPay=PAY_OPTS.reduce((acc,m)=>{
    acc[m]=unclosed.filter((s)=>s.pay===m).reduce((a,b)=>a+b.total,0);
    // Sumar ventas mixtas que incluyen este medio
    unclosed.filter((s)=>s.pay&&s.pay.includes(" + ")).forEach((s)=>{
      const parts=s.pay.split(" + ");
      if(m==="efectivo"&&parts[0]==="efectivo"){
        // El efectivo es el cashAmount guardado — usamos total proporcional si no hay dato
        acc[m]+=(s.cashAmount||0);
      } else if((m==="tarjeta"||m==="QR")&&parts[1]===m){
        acc[m]+=(s.cash2||0);
      }
    });
    return acc;
  },{});
  const totalEf=byPay["efectivo"]||0;const totalDig=(byPay["tarjeta"]||0)+(byPay["QR"]||0);const totalAll=unclosed.reduce((a,b)=>a+b.total,0);
  const last=myCaja[myCaja.length-1];
  const lastByLocal=[...caja].reverse().find((d)=>d.localName===(session?.local||""));

  // Filtered historial
  const filteredCaja=[...myCaja].reverse().filter((d)=>{
    const matchLocal=filtLocal==="todos"||d.localName===filtLocal;
    const matchUser=filtUser==="todos"||String(d.closedBy)===filtUser;
    return matchLocal&&matchUser;
  });

  const doClose=async()=>{
    if(!unclosed.length){notify("No hay ventas sin cerrar","err");return;}
    setSaving(true);
    try{
      await sb.from("gp_caja").insert([{id:Date.now(),closed_by:session.id,closed_by_name:session.name,sale_ids:unclosed.map((s)=>s.id),by_pay:byPay,total_ef:totalEf,total_dig:totalDig,total_all:totalAll,opening_amount:parseFloat(openAmt)||0,retiro_efectivo:parseFloat(retiro)||0,notes,sales_count:unclosed.length,local_name:session.local||""}]);
      notify(`Caja cerrada. ${fmtM(totalAll)}`);setClosing(false);setOpenAmt("");setRetiro("");setNotes("");loadAll();
    }catch(e){notify("Error","err");}
    setSaving(false);
  };
  const delCierre=async(id)=>{
    await sb.from("gp_caja").delete().eq("id",id);
    notify("Cierre eliminado");setConfirmDel(null);loadAll();
  };

  // Unique locals and users that have cierres
  const cajaLocales=[...new Set(myCaja.map(d=>d.localName).filter(Boolean))];
  const cajaUsers=[...new Set(myCaja.map(d=>({id:String(d.closedBy),name:d.closedByName})).map(u=>JSON.stringify(u)))].map(s=>JSON.parse(s));

  return(
    <div className="fade">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}><div><h1 style={{fontSize:18,fontWeight:800,margin:0}}>Cierre de Caja</h1><p style={{color:"#ffffff",fontSize:9,margin:"3px 0 0",letterSpacing:2.5}}>{last?`ÚLTIMO: ${new Date(last.closedAt).toLocaleString("es-AR")}`:"SIN CIERRES"}</p></div><Btn v="g" onClick={()=>setClosing(true)}><Ic n="cash" s={14}/>Cerrar Caja</Btn></div>
      {lastByLocal&&<Card sx={{padding:"12px 18px",marginBottom:14,display:"flex",alignItems:"center",gap:14,background:"#03120a",border:"1px solid #00882233"}}>
        <Ic n="cash" s={20} c="#00cc55"/>
        <div>
          <div style={{fontSize:8,fontWeight:700,letterSpacing:2.5,color:"#ffffff",textTransform:"uppercase",marginBottom:3}}>Fondo del turno anterior · {lastByLocal.localName}</div>
          <div style={{fontSize:22,fontWeight:800,color:"#00cc55"}}>{fmtM((lastByLocal.openingAmount||0))}</div>
          <div style={{fontSize:9,color:"#ffffff",marginTop:2}}>Dejado por {lastByLocal.closedByName} · {new Date(lastByLocal.closedAt).toLocaleString("es-AR")}</div>
        </div>
      </Card>}
      {isAdmin&&<div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:14}}>
        <Stat label="Sin Cerrar" value={unclosed.length} sub="ventas" color="#00d4ff" icon="hist"/>
        <Stat label="Efectivo" value={`${fmtM(totalEf)}`} sub="físico" color="#00cc55" icon="cash"/>
        <Stat label="Tarjeta" value={`${fmtM((byPay["tarjeta"]||0))}`} sub="POS" color="#3388ff" icon="star"/>
        <Stat label="QR" value={`${fmtM((byPay["QR"]||0))}`} sub="digital" color="#ccdd00" icon="trend"/>
      </div>}
      {isAdmin&&myCaja.length>0&&<Card sx={{padding:0,overflow:"hidden"}}>
        <div style={{padding:"11px 16px",borderBottom:"1px solid #192a38",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
          <span style={{fontSize:8,fontWeight:700,letterSpacing:2.5,color:"#ffffff",textTransform:"uppercase"}}>Historial · {filteredCaja.length} cierres</span>
          <div style={{display:"flex",gap:7,alignItems:"center",flexWrap:"wrap"}}>
            {/* Filtro por local */}
            <Sel value={filtLocal} onChange={(e)=>setFiltLocal(e.target.value)} sx={{width:130,fontSize:10,padding:"4px 8px"}}>
              <option value="todos">📍 Todos los locales</option>
              {cajaLocales.map(l=><option key={l} value={l}>{l}</option>)}
            </Sel>
            {/* Filtro por vendedor */}
            <Sel value={filtUser} onChange={(e)=>setFiltUser(e.target.value)} sx={{width:150,fontSize:10,padding:"4px 8px"}}>
              <option value="todos">👤 Todos los vendedores</option>
              {cajaUsers.map(u=><option key={u.id} value={u.id}>{u.name}</option>)}
            </Sel>
            {(filtLocal!=="todos"||filtUser!=="todos")&&<Btn v="gh" sx={{padding:"3px 8px",fontSize:9}} onClick={()=>{setFiltLocal("todos");setFiltUser("todos");}}>Limpiar</Btn>}
          </div>
        </div>
        <table><thead><tr><th>Fecha</th><th>Por</th><th>Local</th><th>Ventas</th><th>Efectivo</th><th>Digital</th><th>Total</th><th>Fondo</th><th>Retiro</th><th></th></tr></thead>
          <tbody>{filteredCaja.map((d)=>(<tr key={d.id}><td style={{fontSize:11}}>{new Date(d.closedAt).toLocaleString("es-AR")}</td><td style={{color:"#ffffff",fontSize:11}}>{d.closedByName}</td><td style={{color:"#00d4ff",fontSize:11}}>{d.localName||"—"}</td><td>{d.salesCount}</td><td style={{color:"#00cc55",fontWeight:700}}>{fmtM((d.totalEf||0))}</td><td style={{color:"#3388ff",fontWeight:700}}>{fmtM((d.totalDig||0))}</td><td style={{fontWeight:800,color:"#00cc55"}}>{fmtM((d.totalAll||0))}</td><td style={{color:"#00cc55",fontSize:11}}>{fmtM((d.openingAmount||0))}</td><td style={{color:d.retiro_efectivo>0?"#ff9900":"#2a3d50",fontWeight:d.retiro_efectivo>0?700:400,fontSize:11}}>{d.retiro_efectivo>0?`${fmtM((d.retiro_efectivo))}`:"—"}</td><td><Btn v="r" sx={{padding:"3px 6px",fontSize:9}} onClick={()=>setConfirmDel(d)}><Ic n="del" s={11}/></Btn></td></tr>))}
          {filteredCaja.length===0&&<tr><td colSpan={10} style={{textAlign:"center",color:"#ffffff",padding:20}}>Sin resultados para ese filtro</td></tr>}
          </tbody>
        </table>
      </Card>}
      {closing&&(<Modal close={()=>setClosing(false)} w={420}><div style={{padding:24}}>
        <h2 style={{margin:"0 0 16px",fontSize:15,fontWeight:800}}>Confirmar Cierre</h2>
        <div style={{background:"#040c16",borderRadius:9,padding:14,marginBottom:14}}>
          {isAdmin&&PAY_OPTS.filter(m=>(byPay[m]||0)>0).map(m=>(<div key={m} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid #192a3818",alignItems:"center"}}><Chip t={m}/><span style={{fontWeight:700,color:"#00cc55"}}>{fmtM((byPay[m]||0))}</span></div>))}
          {isAdmin&&<div style={{display:"flex",justifyContent:"space-between",paddingTop:10,fontWeight:800,fontSize:14,borderTop:"1px solid #192a38",marginTop:4}}><span style={{color:"#ffffff"}}>TOTAL</span><span style={{color:"#00cc55"}}>{fmtM(totalAll)}</span></div>}
        </div>
        <div style={{display:"grid",gridTemplateColumns:isAdmin?"1fr 1fr":"1fr",gap:11,marginBottom:11}}>
          <div><Lbl t="Fondo que dejás ($)"/><Inp type="number" step=".01" placeholder="0.00" value={openAmt} onChange={(e)=>setOpenAmt(e.target.value)}/><div style={{fontSize:9,color:"#ffffff",marginTop:3}}>Lo verá el próximo turno</div></div>
          <div><Lbl t="Retiro en efectivo ($)"/><Inp type="number" step=".01" placeholder="0.00" value={retiro} onChange={(e)=>setRetiro(e.target.value)}/><div style={{fontSize:9,color:"#ffffff",marginTop:3}}>Solo visible para admin</div></div>
        </div>
        <div style={{marginBottom:14}}><Lbl t="Notas"/><textarea value={notes} onChange={(e)=>setNotes(e.target.value)} style={{background:"#060f1a",border:"1px solid #192a38",color:"#ffffff",padding:"9px 12px",borderRadius:6,fontFamily:"inherit",fontSize:13,width:"100%",resize:"vertical",minHeight:60,outline:"none",boxSizing:"border-box"}}/></div>
        <div style={{display:"flex",gap:9,justifyContent:"flex-end"}}><Btn v="gh" onClick={()=>setClosing(false)}>Cancelar</Btn><Btn v="g" onClick={doClose} disabled={saving}>{saving?"Cerrando...":"Confirmar"}</Btn></div>
      </div></Modal>)}
      {confirmDel&&(<Modal close={()=>setConfirmDel(null)} w={380}><div style={{padding:24,textAlign:"center"}}><div style={{fontSize:36,marginBottom:12}}>🗑️</div><h2 style={{margin:"0 0 8px",fontSize:16,fontWeight:800}}>¿Eliminar cierre?</h2><p style={{color:"#ffffff",fontSize:13,marginBottom:4}}>Cierre del <strong style={{color:"#ffffff"}}>{new Date(confirmDel.closedAt).toLocaleString("es-AR")}</strong></p><p style={{color:"#ff9900",fontSize:11,marginBottom:20}}>⚠ Las ventas asociadas quedarán sin cerrar</p><div style={{display:"flex",gap:10,justifyContent:"center"}}><Btn v="gh" onClick={()=>setConfirmDel(null)}>Cancelar</Btn><Btn v="r" onClick={()=>delCierre(confirmDel.id)}><Ic n="del" s={13}/>Eliminar</Btn></div></div></Modal>)}
    </div>
  );
}

function Products({prods,notify,loadAll}) {
  const[modal,setModal]=useState(false);const[form,setForm]=useState(null);const[q,setQ]=useState("");const[catF,setCatF]=useState("Todas");const[saving,setSaving]=useState(false);const[confirmDel,setConfirmDel]=useState(null);
  const openNew=()=>{setForm({name:"",code:"",cat:"Perro",unit:"kg",pricePerKg:0,bulkWeight:25,bulkPrice:0,unitPrice:0,costo:0,stk:0});setModal(true);};
  const openEdit=(p)=>{setForm({...p});setModal(true);};

  const[exportCat,setExportCat]=useState("Todas");

  const exportPDF=()=>{
    const fecha=new Date().toLocaleDateString("es-AR");
    const catEmojis={"Perro":"🐶","Gato":"🐱","Accesorios":"🛍️","Granja":"🌾","Golosinas":"🍬"};
    const catsToExport=exportCat==="Todas"?CATEGORIES:[exportCat];
    const totalExport=prods.filter(p=>catsToExport.includes(p.cat)).length;

    let html=`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Lista de Precios - Masc🐾tas Pet Shop</title>
    <style>
      *{box-sizing:border-box;margin:0;padding:0}
      body{font-family:Arial,sans-serif;padding:15px;color:#000;background:#fff;font-size:11px}
      h1{text-align:center;font-size:18px;margin-bottom:2px}
      .subtitle{text-align:center;color:#555;font-size:10px;margin-bottom:12px}
      .grid{display:grid;grid-template-columns:1fr 1fr;gap:0 20px}
      .cat-block{break-inside:avoid;margin-bottom:10px}
      h2{background:#1a1a2e;color:#fff;padding:4px 8px;font-size:11px;margin-bottom:0;display:flex;align-items:center;gap:4px}
      table{width:100%;border-collapse:collapse}
      th{background:#f0f0f0;padding:3px 6px;text-align:left;font-size:9px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;border-bottom:1px solid #ccc}
      td{padding:3px 6px;border-bottom:1px solid #f0f0f0;font-size:10px;line-height:1.3}
      tr:nth-child(even) td{background:#fafafa}
      .code{color:#777;font-size:9px;font-family:monospace}
      .pkg{font-weight:700;color:#006600}
      .bulk{color:#cc0000}
      .unit{color:#006600;font-weight:700}
      .footer{text-align:center;margin-top:15px;font-size:9px;color:#888;border-top:1px solid #ccc;padding-top:8px;grid-column:1/-1}
      .no-print{text-align:center;margin-bottom:12px;grid-column:1/-1}
      @media print{.no-print{display:none}body{padding:8px}}
    </style></head><body>
    <div class="no-print">
      <button onclick="window.print()" style="background:#006600;color:#fff;border:none;padding:8px 20px;border-radius:5px;font-size:13px;cursor:pointer;margin-right:8px">🖨️ Imprimir / Guardar PDF</button>
      <button onclick="window.close()" style="background:#666;color:#fff;border:none;padding:8px 14px;border-radius:5px;font-size:13px;cursor:pointer">✕ Cerrar</button>
    </div>
    <h1>🐾 Masc🐾tas Pet Shop</h1>
    <div class="subtitle">Lista de Precios · ${fecha}${exportCat!=="Todas"?` · ${exportCat}`:""} · ${totalExport} productos</div>
    <div class="grid">`;

    catsToExport.forEach(cat=>{
      const ps=prods.filter(p=>p.cat===cat).sort((a,b)=>a.name.localeCompare(b.name));
      if(ps.length===0) return;
      const em=catEmojis[cat]||"";
      html+=`<div class="cat-block"><h2>${em} ${cat} (${ps.length})</h2>
      <table><thead><tr><th>#</th><th>Producto</th><th>$/kg</th><th>Bulto</th></tr></thead><tbody>`;
      ps.forEach(p=>{
        if(p.unit==="kg"){
          html+=`<tr>
            <td class="code">${p.code||"—"}</td>
            <td>${p.name}</td>
            <td class="pkg">$${p.pricePerKg.toLocaleString("es-AR")}</td>
            <td class="bulk">${p.bulkWeight>0?`$${p.bulkPrice.toLocaleString("es-AR")}·${fmtW(p.bulkWeight)}`:"—"}</td>
          </tr>`;
        } else {
          html+=`<tr>
            <td class="code">${p.code||"—"}</td>
            <td colspan="2">${p.name}</td>
            <td class="unit">$${(p.unitPrice||0).toLocaleString("es-AR")}/u</td>
          </tr>`;
        }
      });
      html+=`</tbody></table></div>`;
    });

    html+=`<div class="footer">Masc🐾tas Pet Shop · Tel: 2236786886 · Generado el ${fecha}</div></div></body></html>`;
    const win=window.open("","_blank");
    if(win){win.document.write(html);win.document.close();}
    else notify("Permitir ventanas emergentes para exportar","err");
  };

  const save=async()=>{
    if(!form.name.trim()){notify("Nombre requerido","err");return;}
    if(form.code&&form.code.trim()!==""){
      const{data:dup}=await sb.from("gp_products").select("id").eq("code",form.code.trim()).neq("id",form.id||0).maybeSingle();
      if(dup){notify("Ya existe un producto con ese código","err");return;}
    }
    setSaving(true);
    const payload={code:form.code||"",name:form.name,cat:form.cat,unit:form.unit,price_per_kg:form.pricePerKg||0,bulk_weight:form.bulkWeight||0,bulk_price:form.bulkPrice||0,unit_price:form.unitPrice||0,costo:form.costo||0,stk:form.stk||0,min_stk:0,updated_at:new Date().toISOString()};
    try{
      if(form.id) await sb.from("gp_products").update(payload).eq("id",form.id);
      else{
        const{data:newProd}=await sb.from("gp_products").insert([payload]).select().single();
        if(newProd){
          const locs=await sb.from("gp_locales").select("name");
          const locNames=locs.data?.map((l)=>l.name)||["Centro","Norte","Sur"];
          for(const loc of locNames) await sb.from("gp_stock").insert([{product_id:newProd.id,local_name:loc,stk:0}]);
        }
      }
      notify(form.id?"Actualizado":"Creado");loadAll();setModal(false);
    }catch(e){notify("Error","err");}
    setSaving(false);
  };
  const del=async(id)=>{await sb.from("gp_products").delete().eq("id",id);notify("Eliminado");setConfirmDel(null);loadAll();};
  const isKg=form?.unit==="kg";
  const vis=prods.filter((p)=>p.name.toLowerCase().includes(q.toLowerCase())&&(catF==="Todas"||p.cat===catF));
  return(
    <div className="fade">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}><div><h1 style={{fontSize:18,fontWeight:800,margin:0}}>Productos</h1><p style={{color:"#ffffff",fontSize:9,margin:"3px 0 0",letterSpacing:2.5}}>{prods.length} REGISTROS</p></div><div style={{display:"flex",gap:8,alignItems:"center"}}><Sel value={exportCat} onChange={(e)=>setExportCat(e.target.value)} sx={{width:130,fontSize:11}}><option value="Todas">Todas las cats.</option>{CATEGORIES.map(c=><option key={c}>{c}</option>)}</Sel><Btn v="cy" onClick={exportPDF}><Ic n="prt" s={13}/>PDF</Btn><Btn v="g" onClick={openNew}><Ic n="plus" s={13}/>Nuevo</Btn></div></div>
      <div style={{display:"flex",gap:9,marginBottom:12}}><div style={{flex:1,position:"relative"}}><Inp placeholder="Buscar..." value={q} onChange={(e)=>setQ(e.target.value)} sx={{paddingLeft:34}}/><span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",opacity:.3}}><Ic n="srch" s={13}/></span></div><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{["Todas",...CATEGORIES].map(c=>{const[,,tx,em]=CAT_STYLE[c]||["","","#6a8090",""];const active=catF===c;return<button key={c} onClick={()=>setCatF(c)} style={{background:active?"#0b1825":"transparent",border:`1px solid ${active?tx:"#192a38"}`,color:active?tx:"#ffffff",borderRadius:7,padding:"6px 10px",cursor:"pointer",fontFamily:"inherit",fontSize:10,fontWeight:700,transition:"all .15s"}}>{em?`${em} ${c}`:c}</button>;})}</div></div>
      <Card sx={{overflow:"hidden"}}><table><thead><tr><th>Código</th><th>Nombre</th><th>Cat.</th><th>P./Kg</th><th>Bulto</th><th>P.Unit.</th><th></th></tr></thead>
        <tbody>{vis.map((p)=>{const[,,catTx,catEm]=CAT_STYLE[p.cat]||["","","#fff",""];return(<tr key={p.id}><td style={{fontFamily:"monospace",fontSize:11,color:"#00d4ff",fontWeight:700}}>{p.code||"—"}</td><td style={{fontWeight:700,color:"#ffffff"}}>{catEm} {p.name}</td><td><span style={{fontSize:9,background:"#192a38",color:catTx,padding:"2px 7px",borderRadius:10,fontWeight:700}}>{p.cat}</span></td><td style={{color:"#00cc55"}}>{p.unit==="kg"?`${fmtM(p.pricePerKg)}/kg`:"—"}</td><td style={{color:"#3388ff"}}>{p.unit==="kg"&&p.bulkWeight>0?`${fmtW(p.bulkWeight)} $${p.bulkPrice}`:"—"}</td><td style={{color:"#cc44ff"}}>{p.unit!=="kg"?`${fmtM((p.unitPrice||0))}`:"—"}</td><td style={{display:"flex",gap:4}}><Btn v="gh" sx={{padding:"3px 6px",fontSize:9}} onClick={()=>openEdit(p)}><Ic n="edit" s={11}/></Btn><Btn v="r" sx={{padding:"3px 6px",fontSize:9}} onClick={()=>setConfirmDel(p)}><Ic n="del" s={11}/></Btn></td></tr>);})}</tbody>
      </table></Card>
      {confirmDel&&(<Modal close={()=>setConfirmDel(null)} w={360}><div style={{padding:24,textAlign:"center"}}><div style={{fontSize:36,marginBottom:12}}>🗑️</div><h2 style={{margin:"0 0 8px",fontSize:16,fontWeight:800}}>¿Eliminar?</h2><p style={{color:"#ffffff",fontSize:13,marginBottom:20}}><strong style={{color:"#ffffff"}}>{confirmDel.name}</strong></p><div style={{display:"flex",gap:10,justifyContent:"center"}}><Btn v="gh" onClick={()=>setConfirmDel(null)}>Cancelar</Btn><Btn v="r" onClick={()=>del(confirmDel.id)}><Ic n="del" s={13}/>Eliminar</Btn></div></div></Modal>)}
      {modal&&form&&(<Modal close={()=>setModal(false)}><div style={{padding:22}}><h2 style={{margin:"0 0 16px",fontSize:15,fontWeight:800}}>{form.id?"Editar":"Nuevo"} Producto</h2><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:11}}><div><Lbl t="Código"/><Inp value={form.code||""} onChange={(e)=>setForm((f)=>({...f,code:e.target.value}))} placeholder="ej: 1001"/></div><div><Lbl t="Nombre"/><Inp value={form.name} onChange={(e)=>setForm((f)=>({...f,name:e.target.value}))}/></div><div><Lbl t="Categoría"/><Sel value={form.cat} onChange={(e)=>setForm((f)=>({...f,cat:e.target.value}))}>{CATEGORIES.map(c=><option key={c}>{c}</option>)}</Sel></div><div><Lbl t="Tipo"/><Sel value={form.unit} onChange={(e)=>setForm((f)=>({...f,unit:e.target.value}))}><option value="kg">Por Peso (kg)</option><option value="u">Por Unidad</option></Sel></div>{isKg&&<><div><Lbl t="Precio/Kg ($)"/><Inp type="number" step=".01" value={form.pricePerKg} onChange={(e)=>setForm((f)=>({...f,pricePerKg:parseFloat(e.target.value)||0}))}/></div><div><Lbl t="Peso Bulto (kg)"/><Inp type="number" step=".5" value={form.bulkWeight} onChange={(e)=>setForm((f)=>({...f,bulkWeight:parseFloat(e.target.value)||0}))}/></div><div><Lbl t="Precio Bulto ($)"/><Inp type="number" step=".01" value={form.bulkPrice} onChange={(e)=>setForm((f)=>({...f,bulkPrice:parseFloat(e.target.value)||0}))}/></div></>}{!isKg&&<div><Lbl t="Precio Unitario ($)"/><Inp type="number" step=".01" value={form.unitPrice||0} onChange={(e)=>setForm((f)=>({...f,unitPrice:parseFloat(e.target.value)||0}))}/></div>}<div style={{gridColumn:"1/-1",background:"#03120a",border:"1px solid #00882233",borderRadius:8,padding:"10px 12px"}}><Lbl t="💰 Costo del producto ($)"/><Inp type="number" step=".01" value={form.costo||0} onChange={(e)=>setForm((f)=>({...f,costo:parseFloat(e.target.value)||0}))} placeholder="Precio al que comprás (sin IVA)"/><div style={{fontSize:9,color:"#00cc55",marginTop:4}}>Usado para calcular margen real y valor de stock</div></div></div><div style={{display:"flex",gap:9,marginTop:16,justifyContent:"flex-end"}}><Btn v="gh" onClick={()=>setModal(false)}>Cancelar</Btn><Btn v="g" onClick={save} disabled={saving}>{saving?"Guardando...":"Guardar"}</Btn></div></div></Modal>)}
    </div>
  );
}

function UserMgmt({users,notify,session,loadAll,localeNames}) {
  const[modal,setModal]=useState(false);const[form,setForm]=useState(null);const[saving,setSaving]=useState(false);
  const openNew=()=>{setForm({name:"",username:"",password:"",role:"vendedor",local:"",active:true});setModal(true);};
  const openEdit=(u)=>{setForm({...u});setModal(true);};
  const save=async()=>{
    if(!form.name||!form.username||!form.password){notify("Completá todos los campos","err");return;}
    setSaving(true);
    try{
      if(form.id) await sb.from("gp_users").update({name:form.name,username:form.username,password:form.password,role:form.role,local:form.local||"",active:form.active}).eq("id",form.id);
      else{
        const dup=users.find((u)=>u.username===form.username);
        if(dup){notify("Username ya existe","err");setSaving(false);return;}
        await sb.from("gp_users").insert([{name:form.name,username:form.username,password:form.password,role:form.role,local:form.local||"",active:form.active!==false}]);
      }
      notify(form.id?"Actualizado":"Creado");loadAll();setModal(false);
    }catch(e){notify("Error","err");}
    setSaving(false);
  };
  const toggle=async(u)=>{if(u.id===session.id){notify("No podés desactivarte","err");return;}await sb.from("gp_users").update({active:!u.active}).eq("id",u.id);loadAll();};
  const del=async(id)=>{if(id===session.id){notify("No podés eliminarte","err");return;}await sb.from("gp_users").delete().eq("id",id);notify("Eliminado");loadAll();};
  const LOCALES_OPT=["", ...localeNames];
  return(
    <div className="fade">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}><div><h1 style={{fontSize:18,fontWeight:800,margin:0}}>Usuarios</h1><p style={{color:"#ffffff",fontSize:9,margin:"3px 0 0",letterSpacing:2.5}}>{users.length} USUARIOS</p></div><Btn v="g" onClick={openNew}><Ic n="plus" s={13}/>Nuevo</Btn></div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(255px,1fr))",gap:12}}>
        {users.map((u)=>(<Card key={u.id} sx={{padding:17}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}><div style={{display:"flex",alignItems:"center",gap:9}}><div style={{width:34,height:34,borderRadius:"50%",background:u.role==="admin"?"#110310":"#021210",border:`2px solid ${u.role==="admin"?"#cc44ff33":"#00883333"}`,display:"flex",alignItems:"center",justifyContent:"center"}}><Ic n={u.role==="admin"?"shld":"usr"} s={14} c={u.role==="admin"?"#cc44ff":"#00cc55"}/></div><div><div style={{fontSize:13,fontWeight:800,color:"#ffffff"}}>{u.name}</div><div style={{fontSize:9,color:"#ffffff",fontFamily:"monospace"}}>@{u.username}{u.local&&<span style={{marginLeft:5,color:"#00d4ff"}}>· 📍{u.local}</span>}</div></div></div><Chip t={u.role}/></div><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:8,fontWeight:700,background:u.active?"#021408":"#130900",color:u.active?"#00cc55":"#ff9900",padding:"3px 9px",borderRadius:10,letterSpacing:1}}>{u.active?"ACTIVO":"INACTIVO"}</span>{u.id!==session.id&&(<div style={{display:"flex",gap:5}}><Btn v="gh" sx={{padding:"3px 6px",fontSize:9}} onClick={()=>openEdit(u)}><Ic n="edit" s={11}/></Btn><Btn v="gh" sx={{padding:"3px 6px",fontSize:9,color:u.active?"#ff5555":"#00cc55"}} onClick={()=>toggle(u)}>{u.active?"Off":"On"}</Btn><Btn v="r" sx={{padding:"3px 6px",fontSize:9}} onClick={()=>del(u.id)}><Ic n="del" s={11}/></Btn></div>)}{u.id===session.id&&<span style={{fontSize:9,color:"#ffffff"}}>← vos</span>}</div></Card>))}
      </div>
      {modal&&form&&(<Modal close={()=>setModal(false)} w={420}><div style={{padding:22}}><h2 style={{margin:"0 0 16px",fontSize:15,fontWeight:800}}>{form.id?"Editar":"Nuevo"} Usuario</h2><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:11}}><div style={{gridColumn:"1/-1"}}><Lbl t="Nombre"/><Inp value={form.name} onChange={(e)=>setForm((f)=>({...f,name:e.target.value}))}/></div><div><Lbl t="Username"/><Inp value={form.username} onChange={(e)=>setForm((f)=>({...f,username:e.target.value}))}/></div><div><Lbl t="Contraseña"/><Inp value={form.password} onChange={(e)=>setForm((f)=>({...f,password:e.target.value}))}/></div><div><Lbl t="Rol"/><Sel value={form.role} onChange={(e)=>setForm((f)=>({...f,role:e.target.value}))}><option value="vendedor">Vendedor</option><option value="admin">Admin</option></Sel></div><div><Lbl t="Local"/><Sel value={form.local||""} onChange={(e)=>setForm((f)=>({...f,local:e.target.value}))}>{LOCALES_OPT.map(l=><option key={l} value={l}>{l||"— Sin local —"}</option>)}</Sel></div><div style={{gridColumn:"1/-1",display:"flex",alignItems:"center",gap:8}}><input type="checkbox" checked={form.active!==false} onChange={(e)=>setForm((f)=>({...f,active:e.target.checked}))} style={{accentColor:"#00cc55"}}/><span style={{fontSize:12,color:"#ffffff"}}>Activo</span></div></div><div style={{display:"flex",gap:9,marginTop:14,justifyContent:"flex-end"}}><Btn v="gh" onClick={()=>setModal(false)}>Cancelar</Btn><Btn v="g" onClick={save} disabled={saving}>{saving?"Guardando...":"Guardar"}</Btn></div></div></Modal>)}
    </div>
  );
}

function AdminProfile({session,setSession,notify,loadAll}) {
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
    if(cur?.password!==pwOld){notify("Contraseña incorrecta","err");return;}
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
        <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:18}}><div style={{width:52,height:52,borderRadius:"50%",background:"#110310",border:"2px solid #cc44ff44",display:"flex",alignItems:"center",justifyContent:"center"}}><Ic n="shld" s={22} c="#cc44ff"/></div><div><div style={{fontSize:16,fontWeight:800,color:"#ffffff"}}>{session.name}</div><div style={{fontSize:10,color:"#ffffff"}}>@{session.username} · Admin</div></div></div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:11,marginBottom:14}}><div><Lbl t="Nombre"/><Inp value={name} onChange={(e)=>setName(e.target.value)}/></div><div><Lbl t="Username"/><Inp value={username} onChange={(e)=>setUsername(e.target.value)}/></div></div>
        <div style={{display:"flex",justifyContent:"flex-end"}}><Btn v="g" onClick={saveProfile} disabled={saving}>{saving?"Guardando...":"Guardar"}</Btn></div>
      </Card>
      <Card sx={{padding:20}}>
        <div style={{fontSize:11,fontWeight:700,color:"#ffffff",marginBottom:14,display:"flex",alignItems:"center",gap:7}}><Ic n="key" s={14} c="#00d4ff"/>Cambiar Contraseña</div>
        <div style={{marginBottom:11}}><Lbl t="Actual"/><div style={{position:"relative"}}><Inp type={showPw?"text":"password"} value={pwOld} onChange={(e)=>setPwOld(e.target.value)} placeholder="••••••••"/><button onClick={()=>setShowPw((s)=>!s)} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:"#ffffff",cursor:"pointer",fontSize:11}}>{showPw?"🙈":"👁"}</button></div></div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:11,marginBottom:11}}><div><Lbl t="Nueva"/><Inp type={showPw?"text":"password"} value={pwNew} onChange={(e)=>setPwNew(e.target.value)}/></div><div><Lbl t="Confirmar"/><Inp type={showPw?"text":"password"} value={pwConf} onChange={(e)=>setPwConf(e.target.value)}/></div></div>
        {pwNew&&pwConf&&<div style={{fontSize:11,marginBottom:10,color:pwNew===pwConf?"#00cc55":"#ff6666"}}>{pwNew===pwConf?"✓ Coinciden":"✗ No coinciden"}</div>}
        <div style={{display:"flex",justifyContent:"flex-end"}}><Btn v="cy" onClick={savePassword} disabled={saving}><Ic n="key" s={13}/>Actualizar</Btn></div>
      </Card>
    </div>
  );
}

function Rentabilidad({prods,sales,stock,localeNames,stockMgt}) {
  const[periodo,setPeriodo]=useState(30);
  const[iibb,setIibb]=useState(3);
  const[payway,setPayway]=useState(2.5);

  const hoy=new Date();
  const desdeFecha=new Date(hoy);
  desdeFecha.setDate(hoy.getDate()-periodo);
  const desdeStr=desdeFecha.toISOString().split("T")[0];

  // Locales de venta (excluir DEPOSITO)
  const localesVenta=localeNames.filter(l=>!l.toUpperCase().includes("DEPOSIT"));

  // Ventas del período filtradas
  const ventasPeriodo=sales.filter(s=>s.date>=desdeStr);

  // Para cada local calcular métricas
  const metricas=localesVenta.map(loc=>{
    const ventasLocal=ventasPeriodo.filter(s=>s.localName===loc);
    const totalVentas=ventasLocal.reduce((a,b)=>a+b.total,0);
    const cantVentas=ventasLocal.length;

    // CMV estimado: para cada venta, buscar los items y calcular costo
    let cmv=0;
    ventasLocal.forEach(s=>{
      (s.items||[]).forEach(it=>{
        const prod=prods.find(p=>p.id===it.pid);
        if(!prod||!prod.costo) return;
        // Calcular unidades vendidas
        const qty=prod.unit==="kg"?it.qty:(it.type==="bulto"?it.qty/prod.bulkWeight:it.qty);
        cmv+=qty*(prod.costo||0);
      });
    });

    // Valor del stock actual a costo
    const stockLocal=stockMgt.filter(s=>s.localName===loc);
    let valorStockCosto=0;
    stockLocal.forEach(s=>{
      const prod=prods.find(p=>p.id===s.productId);
      if(!prod||!prod.costo) return;
      valorStockCosto+=Math.max(0,s.stk)*(prod.costo||0);
    });

    // Días de inventario
    const cmvDia=periodo>0?cmv/periodo:0;
    const diasInventario=cmvDia>0?Math.round(valorStockCosto/cmvDia):null;

    // Margen bruto
    const margenBruto=totalVentas>0?((totalVentas-cmv)/totalVentas*100):null;

    // Descuentos: IIBB + Payway proporcional
    const ventasDigital=ventasLocal.filter(s=>s.pay==="tarjeta"||s.pay==="QR"||s.pay?.includes("+")).reduce((a,b)=>a+b.total,0);
    const costoIIBB=totalVentas*(iibb/100);
    const costoPayway=ventasDigital*(payway/100);
    const margenNeto=totalVentas>0?((totalVentas-cmv-costoIIBB-costoPayway)/totalVentas*100):null;

    // Productos sin costo cargado
    const prodsSinCosto=prods.filter(p=>{
      const enLocal=stockLocal.find(s=>s.productId===p.id);
      return enLocal&&(!p.costo||p.costo===0);
    }).length;

    return{loc,totalVentas,cantVentas,cmv,valorStockCosto,diasInventario,margenBruto,margenNeto,costoIIBB,costoPayway,prodsSinCosto};
  }).sort((a,b)=>b.totalVentas-a.totalVentas);

  const totales={
    ventas:metricas.reduce((a,b)=>a+b.totalVentas,0),
    cmv:metricas.reduce((a,b)=>a+b.cmv,0),
    stock:metricas.reduce((a,b)=>a+b.valorStockCosto,0),
  };

  const sinCostoTotal=prods.filter(p=>!p.costo||p.costo===0).length;

  return(
    <div className="fade">
      <div style={{marginBottom:16}}>
        <h1 style={{fontSize:18,fontWeight:800,margin:0}}>Rentabilidad por Local</h1>
        <p style={{color:"#ffffff",fontSize:9,margin:"3px 0 0",letterSpacing:2.5}}>MARGEN REAL · DÍAS DE INVENTARIO · DIAGNÓSTICO DE CAJA</p>
      </div>

      {sinCostoTotal>0&&<div style={{background:"#140800",border:"1px solid #ff990055",borderRadius:8,padding:"10px 16px",marginBottom:14,display:"flex",alignItems:"center",gap:10}}>
        <Ic n="warn" s={16} c="#ff9900"/>
        <div style={{fontSize:11,color:"#ff9900"}}>
          <strong>{sinCostoTotal} productos</strong> sin precio de costo cargado — los cálculos de margen y CMV son parciales.
          <span style={{color:"#ffffff",marginLeft:6}}>Cargalos en Productos → Editar → campo "Costo"</span>
        </div>
      </div>}

      {/* Configuración */}
      <Card sx={{padding:"14px 16px",marginBottom:14}}>
        <div style={{display:"flex",gap:16,alignItems:"center",flexWrap:"wrap"}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <Lbl t="Período"/>
            <Sel value={periodo} onChange={(e)=>setPeriodo(parseInt(e.target.value))} sx={{width:120}}>
              <option value={30}>30 días</option>
              <option value={60}>60 días</option>
              <option value={90}>90 días</option>
            </Sel>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <Lbl t="IIBB %"/>
            <Inp type="number" step="0.1" value={iibb} onChange={(e)=>setIibb(parseFloat(e.target.value)||0)} sx={{width:70}}/>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <Lbl t="Payway %"/>
            <Inp type="number" step="0.1" value={payway} onChange={(e)=>setPayway(parseFloat(e.target.value)||0)} sx={{width:70}}/>
          </div>
          <div style={{fontSize:10,color:"#ffffff"}}>Período: {desdeFecha.toLocaleDateString("es-AR")} → hoy</div>
        </div>
      </Card>

      {/* Totales */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:14}}>
        <Stat label="Ventas totales" value={fmtM(totales.ventas)} sub={`${ventasPeriodo.length} operaciones`} color="#00cc55" icon="trend"/>
        <Stat label="CMV estimado" value={fmtM(totales.cmv)} sub="costo mercadería vendida" color="#ff9900" icon="box"/>
        <Stat label="Stock a costo" value={fmtM(totales.stock)} sub="plata inmovilizada" color="#00d4ff" icon="stk"/>
      </div>

      {/* Tabla por local */}
      <Card sx={{overflow:"hidden",marginBottom:14}}>
        <div style={{padding:"11px 16px",borderBottom:"1px solid #192a38"}}>
          <span style={{fontSize:8,fontWeight:700,letterSpacing:2.5,color:"#ffffff",textTransform:"uppercase"}}>Comparativo por Local · {periodo} días</span>
        </div>
        <table>
          <thead><tr><th>Local</th><th>Ventas</th><th>CMV</th><th>Margen Bruto</th><th>IIBB+Payway</th><th>Margen Neto</th><th>Stock $</th><th>Días Inv.</th><th>⚠</th></tr></thead>
          <tbody>{metricas.map(m=>{
            const diasColor=m.diasInventario===null?"#ffffff":m.diasInventario>60?"#ff4444":m.diasInventario>30?"#ff9900":"#00cc55";
            const margenColor=m.margenNeto===null?"#ffffff":m.margenNeto<10?"#ff4444":m.margenNeto<20?"#ff9900":"#00cc55";
            return(<tr key={m.loc}>
              <td style={{fontWeight:700,color:"#00d4ff"}}>📍 {m.loc}</td>
              <td style={{color:"#00cc55",fontWeight:700}}>{fmtM(m.totalVentas)}</td>
              <td style={{color:"#ff9900"}}>{fmtM(m.cmv)}</td>
              <td style={{color:m.margenBruto===null?"#ffffff":m.margenBruto>25?"#00cc55":"#ff9900",fontWeight:700}}>{m.margenBruto!==null?`${m.margenBruto.toFixed(1)}%`:"—"}</td>
              <td style={{color:"#ff6666",fontSize:11}}>{fmtM(m.costoIIBB+m.costoPayway)}</td>
              <td style={{color:margenColor,fontWeight:800,fontSize:13}}>{m.margenNeto!==null?`${m.margenNeto.toFixed(1)}%`:"—"}</td>
              <td style={{color:"#00d4ff"}}>{fmtM(m.valorStockCosto)}</td>
              <td style={{color:diasColor,fontWeight:700}}>{m.diasInventario!==null?`${m.diasInventario}d`:"—"}</td>
              <td>{m.prodsSinCosto>0&&<span style={{fontSize:9,background:"#140800",color:"#ff9900",padding:"2px 6px",borderRadius:8}}>{m.prodsSinCosto} sin costo</span>}</td>
            </tr>);
          })}</tbody>
        </table>
      </Card>

      {/* Diagnóstico */}
      <Card sx={{padding:20}}>
        <h2 style={{fontSize:14,fontWeight:800,margin:"0 0 14px"}}>🔍 Diagnóstico de Liquidez</h2>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          {metricas.filter(m=>m.diasInventario!==null).map(m=>{
            const alerta=m.diasInventario>45||m.margenNeto<10;
            return(<div key={m.loc} style={{background:alerta?"#110305":"#03120a",border:`1px solid ${alerta?"#ff333333":"#00882233"}`,borderRadius:8,padding:"12px 14px"}}>
              <div style={{fontWeight:700,color:"#ffffff",marginBottom:6}}>📍 {m.loc}</div>
              {m.diasInventario>45&&<div style={{fontSize:11,color:"#ff6666",marginBottom:4}}>⚠ Stock parado {m.diasInventario} días → {fmtM(m.valorStockCosto)} inmovilizados</div>}
              {m.margenNeto!==null&&m.margenNeto<15&&<div style={{fontSize:11,color:"#ff9900",marginBottom:4}}>⚠ Margen neto bajo: {m.margenNeto.toFixed(1)}%</div>}
              {!alerta&&<div style={{fontSize:11,color:"#00cc55"}}>✓ Rotación y margen normales</div>}
              {m.prodsSinCosto>0&&<div style={{fontSize:10,color:"#ff9900",marginTop:4}}>📝 {m.prodsSinCosto} productos sin costo → análisis incompleto</div>}
            </div>);
          })}
        </div>
        {sinCostoTotal>0&&<div style={{marginTop:14,padding:"10px 14px",background:"#030810",border:"1px solid #192a38",borderRadius:8,fontSize:11,color:"#ffffff"}}>
          <strong style={{color:"#00d4ff"}}>Próximo paso:</strong> Cargá el precio de costo en cada producto (Productos → Editar → campo "Costo"). Con más costos cargados, el diagnóstico va a ser más preciso.
        </div>}
      </Card>
    </div>
  );
}

// ─── PROVEEDORES ───────────────────────────────────────────────────────────

function Proveedores({notify}) {
  const[provs,setProvs]=useState([]);
  const[loading,setLoading]=useState(true);
  const[modal,setModal]=useState(false);
  const[form,setForm]=useState(null);
  const[saving,setSaving]=useState(false);
  const[detId,setDetId]=useState(null);
  const[pagos,setPagos]=useState([]);
  const[facturas,setFacturas]=useState([]);
  const[tab,setTab]=useState("facturas");
  const[pagoModal,setPagoModal]=useState(false);
  const[factModal,setFactModal]=useState(false);
  const[pagoForm,setPagoForm]=useState(null);
  const[factForm,setFactForm]=useState(null);
  const[selectedFacts,setSelectedFacts]=useState([]);
  const[descuentoPct,setDescuentoPct]=useState("");
  const[tipoPagoPanel,setTipoPagoPanel]=useState("efectivo");
  const[q,setQ]=useState("");
  const[confirmDel,setConfirmDel]=useState(null);

  const load=async()=>{
    setLoading(true);
    const{data}=await sb.from("gp_proveedores").select("*").order("nombre");
    setProvs(data||[]);
    setLoading(false);
  };

  const loadDet=async(pid)=>{
    const[pg,fc]=await Promise.all([
      sb.from("gp_prov_pagos").select("*").eq("proveedor_id",pid).order("fecha",{ascending:false}),
      sb.from("gp_prov_facturas").select("*").eq("proveedor_id",pid).order("fecha",{ascending:false}),
    ]);
    setPagos(pg.data||[]);
    setFacturas(fc.data||[]);
  };

  useEffect(()=>{load();},[]);

  const openNew=()=>{setForm({nombre:"",cuit:"",telefono:"",vendedor:"",email:"",direccion:"",condiciones:"",descuentos:"",dias_plazo:0,notas:"",activo:true});setModal(true);};
  const openEdit=(p)=>{setForm({...p});setModal(true);};

  const save=async()=>{
    if(!form.nombre.trim()){notify("Nombre requerido","err");return;}
    setSaving(true);
    try{
      if(form.id) await sb.from("gp_proveedores").update({nombre:form.nombre,cuit:form.cuit,telefono:form.telefono,vendedor:form.vendedor,email:form.email,direccion:form.direccion,condiciones:form.condiciones,descuentos:form.descuentos,dias_plazo:parseInt(form.dias_plazo)||0,notas:form.notas,activo:form.activo}).eq("id",form.id);
      else await sb.from("gp_proveedores").insert([{nombre:form.nombre,cuit:form.cuit,telefono:form.telefono,vendedor:form.vendedor,email:form.email,direccion:form.direccion,condiciones:form.condiciones,descuentos:form.descuentos,dias_plazo:parseInt(form.dias_plazo)||0,notas:form.notas,activo:form.activo!==false}]);
      notify(form.id?"Proveedor actualizado":"Proveedor creado");setModal(false);load();
    }catch(e){notify("Error","err");}
    setSaving(false);
  };

  const del=async(id)=>{await sb.from("gp_proveedores").delete().eq("id",id);notify("Eliminado");setConfirmDel(null);load();};

  const savePago=async()=>{
    const montoBase=selectedFacts.reduce((a,b)=>a+Number(b.monto),0);
    if(montoBase<=0){notify("Seleccioná al menos una factura","err");return;}
    const descPct=parseFloat(descuentoPct)||0;
    const montoFinal=montoBase*(1-descPct/100);
    const refs=selectedFacts.map(f=>f.numero||`#${f.id}`).join(", ");
    setSaving(true);
    try{
      // Registrar el pago
      await sb.from("gp_prov_pagos").insert([{
        proveedor_id:detId,
        fecha:pagoForm.fecha,
        monto:montoFinal,
        tipo:tipoPagoPanel,
        factura:refs,
        es_blanco:pagoForm.es_blanco,
        notas:(pagoForm.notas||"")+(descPct>0?` [Desc. ${descPct}% sobre ${fmtM(montoBase)}]`:"")
      }]);
      // Marcar facturas seleccionadas como pagadas
      for(const f of selectedFacts){
        await sb.from("gp_prov_facturas").update({pagada:true}).eq("id",f.id);
      }
      notify(`Pago registrado${descPct>0?` · Ahorro ${fmtM(montoBase-montoFinal)}`:""} · ${selectedFacts.length} factura${selectedFacts.length>1?"s":""} saldada${selectedFacts.length>1?"s":""}`);
      setPagoModal(false);setSelectedFacts([]);setDescuentoPct("");setTipoPagoPanel("efectivo");loadDet(detId);
    }catch(e){notify("Error","err");}
    setSaving(false);
  };

  const saveFact=async()=>{
    if(!factForm.monto||parseFloat(factForm.monto)<=0){notify("Monto inválido","err");return;}
    setSaving(true);
    try{
      await sb.from("gp_prov_facturas").insert([{proveedor_id:detId,fecha:factForm.fecha,fecha_vencimiento:factForm.fecha_vencimiento||null,numero:factForm.numero,monto:parseFloat(factForm.monto),es_blanco:factForm.es_blanco,concepto:factForm.concepto,pagada:false,notas:factForm.notas}]);
      notify("Factura registrada");setFactModal(false);loadDet(detId);
    }catch(e){notify("Error","err");}
    setSaving(false);
  };

  const togglePagada=async(f)=>{
    await sb.from("gp_prov_facturas").update({pagada:!f.pagada}).eq("id",f.id);
    loadDet(detId);
  };

  const vis=provs.filter(p=>p.nombre.toLowerCase().includes(q.toLowerCase())||(p.vendedor&&p.vendedor.toLowerCase().includes(q.toLowerCase())));
  const detProv=provs.find(p=>p.id===detId);
  const totalPagos=pagos.reduce((a,b)=>a+Number(b.monto),0);
  const totalFacturado=facturas.reduce((a,b)=>a+Number(b.monto),0);
  const totalPendiente=facturas.filter(f=>!f.pagada).reduce((a,b)=>a+Number(b.monto),0);
  const hoy=todayStr();

  return(
    <div className="fade">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div><h1 style={{fontSize:18,fontWeight:800,margin:0}}>Proveedores</h1><p style={{color:"#ffffff",fontSize:9,margin:"3px 0 0",letterSpacing:2.5}}>{provs.length} REGISTROS</p></div>
        <Btn v="g" onClick={openNew}><Ic n="plus" s={13}/>Nuevo</Btn>
      </div>
      <div style={{position:"relative",marginBottom:12}}><Inp placeholder="Buscar por nombre o vendedor..." value={q} onChange={(e)=>setQ(e.target.value)} sx={{paddingLeft:34}}/><span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",opacity:.5}}><Ic n="srch" s={13}/></span></div>

      {loading&&<div style={{padding:20,textAlign:"center",color:"#ffffff"}}>Cargando...</div>}
      {!loading&&<Card sx={{overflow:"hidden"}}>
        <table>
          <thead><tr><th>Proveedor</th><th>CUIT</th><th>Teléfono</th><th>Vendedor</th><th>Plazo</th><th>Estado</th><th></th></tr></thead>
          <tbody>{vis.map(p=>(<tr key={p.id}>
            <td style={{fontWeight:700,color:"#ffffff"}}>{p.nombre}</td>
            <td style={{color:"#ffffff",fontSize:11,fontFamily:"monospace"}}>{p.cuit||"—"}</td>
            <td style={{color:"#ffffff"}}>{p.telefono||"—"}</td>
            <td style={{color:"#ffffff"}}>{p.vendedor||"—"}</td>
            <td style={{color:"#00d4ff",fontWeight:700}}>{p.dias_plazo?`${p.dias_plazo}d`:"—"}</td>
            <td><span style={{fontSize:9,fontWeight:700,padding:"2px 8px",borderRadius:10,background:p.activo?"#021408":"#130900",color:p.activo?"#00cc55":"#ff9900",border:`1px solid ${p.activo?"#00882233":"#ff990033"}`}}>{p.activo?"ACTIVO":"INACTIVO"}</span></td>
            <td><div style={{display:"flex",gap:4}}>
              <Btn v="cy" sx={{padding:"3px 6px",fontSize:9}} onClick={()=>{setDetId(p.id);setTab("facturas");loadDet(p.id);}}><Ic n="hist" s={11}/>C.Cte</Btn>
              <Btn v="gh" sx={{padding:"3px 6px",fontSize:9}} onClick={()=>openEdit(p)}><Ic n="edit" s={11}/></Btn>
              <Btn v="r" sx={{padding:"3px 6px",fontSize:9}} onClick={()=>setConfirmDel(p)}><Ic n="del" s={11}/></Btn>
            </div></td>
          </tr>))}
          {vis.length===0&&<tr><td colSpan={7} style={{textAlign:"center",padding:20,color:"#ffffff"}}>Sin proveedores</td></tr>}
          </tbody>
        </table>
      </Card>}

      {/* Modal nuevo/editar proveedor */}
      {modal&&form&&<Modal close={()=>setModal(false)} w={600}><div style={{padding:22}}>
        <h2 style={{margin:"0 0 16px",fontSize:15,fontWeight:800}}>{form.id?"Editar":"Nuevo"} Proveedor</h2>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:11}}>
          <div style={{gridColumn:"1/-1"}}><Lbl t="Nombre del proveedor"/><Inp value={form.nombre} onChange={(e)=>setForm(f=>({...f,nombre:e.target.value}))}/></div>
          <div><Lbl t="CUIT"/><Inp value={form.cuit||""} onChange={(e)=>setForm(f=>({...f,cuit:e.target.value}))}/></div>
          <div><Lbl t="Teléfono"/><Inp value={form.telefono||""} onChange={(e)=>setForm(f=>({...f,telefono:e.target.value}))}/></div>
          <div><Lbl t="Vendedor"/><Inp value={form.vendedor||""} onChange={(e)=>setForm(f=>({...f,vendedor:e.target.value}))}/></div>
          <div><Lbl t="Email"/><Inp value={form.email||""} onChange={(e)=>setForm(f=>({...f,email:e.target.value}))}/></div>
          <div style={{gridColumn:"1/-1"}}><Lbl t="Dirección"/><Inp value={form.direccion||""} onChange={(e)=>setForm(f=>({...f,direccion:e.target.value}))}/></div>
          <div><Lbl t="Días plazo de pago"/><Inp type="number" value={form.dias_plazo||0} onChange={(e)=>setForm(f=>({...f,dias_plazo:e.target.value}))}/></div>
          <div style={{display:"flex",alignItems:"center",gap:8,paddingTop:20}}><input type="checkbox" checked={form.activo!==false} onChange={(e)=>setForm(f=>({...f,activo:e.target.checked}))} style={{accentColor:"#00cc55"}}/><span style={{fontSize:12,color:"#ffffff"}}>Activo</span></div>
          <div style={{gridColumn:"1/-1"}}><Lbl t="Condiciones de venta (ej: 10+1, bonificaciones)"/><textarea value={form.condiciones||""} onChange={(e)=>setForm(f=>({...f,condiciones:e.target.value}))} style={{background:"#060f1a",border:"1px solid #192a38",color:"#ffffff",padding:"9px 12px",borderRadius:6,fontFamily:"inherit",fontSize:13,width:"100%",resize:"vertical",minHeight:60,outline:"none",boxSizing:"border-box"}}/></div>
          <div style={{gridColumn:"1/-1"}}><Lbl t="Descuentos extra"/><Inp value={form.descuentos||""} onChange={(e)=>setForm(f=>({...f,descuentos:e.target.value}))}/></div>
          <div style={{gridColumn:"1/-1"}}><Lbl t="Notas / Comentarios"/><textarea value={form.notas||""} onChange={(e)=>setForm(f=>({...f,notas:e.target.value}))} style={{background:"#060f1a",border:"1px solid #192a38",color:"#ffffff",padding:"9px 12px",borderRadius:6,fontFamily:"inherit",fontSize:13,width:"100%",resize:"vertical",minHeight:60,outline:"none",boxSizing:"border-box"}}/></div>
        </div>
        <div style={{display:"flex",gap:9,marginTop:16,justifyContent:"flex-end"}}><Btn v="gh" onClick={()=>setModal(false)}>Cancelar</Btn><Btn v="g" onClick={save} disabled={saving}>{saving?"Guardando...":"Guardar"}</Btn></div>
      </div></Modal>}

      {/* Modal cuenta corriente */}
      {detId&&detProv&&<Modal close={()=>{setDetId(null);setSelectedFacts([]);setDescuentoPct("");}} w={960}><div style={{padding:22}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div>
            <h2 style={{margin:0,fontSize:16,fontWeight:800}}>{detProv.nombre}</h2>
            <div style={{fontSize:10,color:"#ffffff",marginTop:3}}>{detProv.telefono&&`📞 ${detProv.telefono}`}{detProv.vendedor&&` · Vendedor: ${detProv.vendedor}`}{detProv.dias_plazo?` · Plazo: ${detProv.dias_plazo}d`:""}</div>
          </div>
          <Btn v="gh" sx={{padding:"3px 8px"}} onClick={()=>setDetId(null)}><Ic n="x" s={13}/></Btn>
        </div>
        {detProv.condiciones&&<div style={{background:"#021520",border:"1px solid #00d4ff33",borderRadius:7,padding:"7px 12px",marginBottom:8,fontSize:11,color:"#00d4ff"}}>📋 {detProv.condiciones}</div>}
        {detProv.descuentos&&<div style={{background:"#021408",border:"1px solid #00882233",borderRadius:7,padding:"7px 12px",marginBottom:8,fontSize:11,color:"#00cc55"}}>🎯 {detProv.descuentos}</div>}
        {detProv.notas&&<div style={{background:"#0a0808",border:"1px solid #ff990033",borderRadius:7,padding:"7px 12px",marginBottom:8,fontSize:11,color:"#ff9900"}}>💬 {detProv.notas}</div>}

        {/* Resumen cuenta corriente */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:12}}>
          <div style={{background:"#030810",border:"1px solid #192a38",borderRadius:8,padding:"10px 12px",textAlign:"center"}}><div style={{fontSize:9,color:"#ffffff",letterSpacing:1,marginBottom:3}}>TOTAL FACTURADO</div><div style={{fontSize:15,fontWeight:800,color:"#ff9900"}}>{fmtM(totalFacturado)}</div></div>
          <div style={{background:"#030810",border:"1px solid #192a38",borderRadius:8,padding:"10px 12px",textAlign:"center"}}><div style={{fontSize:9,color:"#ffffff",letterSpacing:1,marginBottom:3}}>TOTAL PAGADO</div><div style={{fontSize:15,fontWeight:800,color:"#00cc55"}}>{fmtM(totalPagos)}</div></div>
          <div style={{background:totalPendiente>0?"#110305":"#030810",border:`1px solid ${totalPendiente>0?"#ff333333":"#192a38"}`,borderRadius:8,padding:"10px 12px",textAlign:"center"}}><div style={{fontSize:9,color:"#ffffff",letterSpacing:1,marginBottom:3}}>SALDO PENDIENTE</div><div style={{fontSize:15,fontWeight:800,color:totalPendiente>0?"#ff4444":"#00cc55"}}>{fmtM(totalPendiente)}</div></div>
        </div>

        {/* Tabs */}
        <div style={{display:"flex",gap:8,marginBottom:12}}>
          <button onClick={()=>setTab("facturas")} style={{flex:1,padding:"7px 0",borderRadius:6,border:`1px solid ${tab==="facturas"?"#ff9900":"#192a38"}`,background:tab==="facturas"?"#140800":"transparent",color:tab==="facturas"?"#ff9900":"#ffffff",cursor:"pointer",fontFamily:"inherit",fontSize:11,fontWeight:700}}>🧾 Facturas ({facturas.length})</button>
          <button onClick={()=>setTab("pagos")} style={{flex:1,padding:"7px 0",borderRadius:6,border:`1px solid ${tab==="pagos"?"#00cc55":"#192a38"}`,background:tab==="pagos"?"#021408":"transparent",color:tab==="pagos"?"#00cc55":"#ffffff",cursor:"pointer",fontFamily:"inherit",fontSize:11,fontWeight:700}}>💰 Pagos ({pagos.length})</button>
        </div>

        {tab==="facturas"&&<>
          <div style={{display:"flex",justifyContent:"flex-end",marginBottom:8}}>
            <Btn v="or" sx={{padding:"5px 12px",fontSize:10}} onClick={()=>{setFactForm({fecha:todayStr(),fecha_vencimiento:"",numero:"",monto:"",es_blanco:true,concepto:"",notas:""});setFactModal(true);}}><Ic n="plus" s={12}/>Cargar Factura</Btn>
          </div>

          {/* Panel de pago integrado cuando hay seleccionadas */}
          {selectedFacts.length>0&&<div style={{background:"#021408",border:"2px solid #00882266",borderRadius:10,padding:"14px 16px",marginBottom:12}}>
            <div style={{fontSize:11,fontWeight:700,color:"#00cc55",marginBottom:10}}>💰 Pagar {selectedFacts.length} factura{selectedFacts.length>1?"s":""} seleccionada{selectedFacts.length>1?"s":""}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8,alignItems:"end",marginBottom:8}}>
              <div>
                <div style={{fontSize:9,color:"#ffffff",letterSpacing:1,marginBottom:3}}>TOTAL SELECCIONADO</div>
                <div style={{fontSize:16,fontWeight:900,color:"#ff9900"}}>{fmtM(selectedFacts.reduce((a,b)=>a+Number(b.monto),0))}</div>
              </div>
              <div>
                <Lbl t="Descuento %"/>
                <Inp type="number" step="0.1" min="0" max="100" placeholder="0" value={descuentoPct} onChange={(e)=>setDescuentoPct(e.target.value)} sx={{fontSize:13}}/>
              </div>
              <div>
                <div style={{fontSize:9,color:"#ffffff",letterSpacing:1,marginBottom:3}}>MONTO FINAL A PAGAR</div>
                <div style={{fontSize:16,fontWeight:900,color:"#00cc55"}}>{fmtM(selectedFacts.reduce((a,b)=>a+Number(b.monto),0)*(1-(parseFloat(descuentoPct)||0)/100))}</div>
                {(parseFloat(descuentoPct)||0)>0&&<div style={{fontSize:9,color:"#00cc55"}}>Ahorro: {fmtM(selectedFacts.reduce((a,b)=>a+Number(b.monto),0)*(parseFloat(descuentoPct)||0)/100)}</div>}
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                <Btn v="g" sx={{justifyContent:"center",fontSize:10}} onClick={()=>{setPagoForm({fecha:todayStr(),tipo:tipoPagoPanel,es_blanco:true,notas:""});setPagoModal(true);}}>✓ Confirmar Pago</Btn>
                <Btn v="gh" sx={{justifyContent:"center",fontSize:10}} onClick={()=>{setSelectedFacts([]);setDescuentoPct("");}}>✕ Cancelar</Btn>
              </div>
            </div>
            <div style={{display:"flex",gap:12,alignItems:"center",flexWrap:"wrap"}}>
              <span style={{fontSize:9,color:"#ffffff",letterSpacing:1,textTransform:"uppercase"}}>Forma de pago:</span>
              {["efectivo","transferencia"].map(t=>(
                <label key={t} style={{display:"flex",alignItems:"center",gap:5,cursor:"pointer"}}>
                  <input type="radio" checked={tipoPagoPanel===t} onChange={()=>setTipoPagoPanel(t)} style={{accentColor:"#00cc55"}}/>
                  <span style={{fontSize:11,color:tipoPagoPanel===t?"#00cc55":"#ffffff",fontWeight:tipoPagoPanel===t?700:400,textTransform:"capitalize"}}>{t}</span>
                </label>
              ))}
              <span style={{fontSize:10,color:"#ffffff",marginLeft:"auto"}}>Facturas: {selectedFacts.map(f=>f.numero||`#${f.id}`).join(" · ")}</span>
            </div>
          </div>}

          <Card sx={{overflow:"hidden",maxHeight:300,overflowY:"auto"}}>
            <table><thead><tr><th style={{width:32}}></th><th>Fecha</th><th>Vencim.</th><th>Nº Factura</th><th>Concepto</th><th>Monto</th><th>Tipo</th><th>Estado</th><th style={{minWidth:80}}>Eliminar</th></tr></thead>
              <tbody>{facturas.map(f=>{
                const vencida=f.fecha_vencimiento&&f.fecha_vencimiento<hoy&&!f.pagada;
                const seleccionada=selectedFacts.some(s=>s.id===f.id);
                return(<tr key={f.id} style={{background:seleccionada?"#021408":vencida?"#110305":"transparent",cursor:f.pagada?"default":"pointer"}} onClick={()=>{
                  if(f.pagada) return;
                  setSelectedFacts(prev=>seleccionada?prev.filter(s=>s.id!==f.id):[...prev,f]);
                }}>
                  <td onClick={(e)=>e.stopPropagation()}>
                    {!f.pagada&&<input type="checkbox" checked={seleccionada} onChange={(e)=>{e.stopPropagation();setSelectedFacts(prev=>e.target.checked?[...prev,f]:prev.filter(s=>s.id!==f.id));}} style={{accentColor:"#00cc55",cursor:"pointer"}}/>}
                  </td>
                  <td style={{fontSize:11}}>{f.fecha}</td>
                  <td style={{fontSize:11,color:vencida?"#ff4444":"#ffffff",fontWeight:vencida?700:400}}>{f.fecha_vencimiento||"—"}{vencida&&" ⚠"}</td>
                  <td style={{fontSize:11,fontFamily:"monospace",color:"#ffffff"}}>{f.numero||"—"}</td>
                  <td style={{fontSize:11,color:"#ffffff"}}>{f.concepto||"—"}</td>
                  <td style={{color:"#ff9900",fontWeight:700}}>{fmtM(f.monto)}</td>
                  <td><span style={{fontSize:9,fontWeight:700,padding:"2px 6px",borderRadius:8,background:f.es_blanco?"#021520":"#0a0800",color:f.es_blanco?"#00d4ff":"#ff9900"}}>{f.es_blanco?"⬜ B":"⬛ N"}</span></td>
                  <td><button onClick={(e)=>{e.stopPropagation();togglePagada(f);}} style={{fontSize:9,fontWeight:700,padding:"2px 8px",borderRadius:8,border:"none",cursor:"pointer",background:f.pagada?"#021408":"#110305",color:f.pagada?"#00cc55":"#ff4444"}}>{f.pagada?"✓ PAGADA":"PENDIENTE"}</button></td>
                  <td onClick={(e)=>e.stopPropagation()}><Btn v="r" sx={{padding:"4px 10px",fontSize:10,fontWeight:700}} onClick={async()=>{if(window.confirm(`¿Eliminar factura ${f.numero||"#"+f.id} por ${fmtM(f.monto)}? Esta acción no se puede deshacer.`)){await sb.from("gp_prov_facturas").delete().eq("id",f.id);loadDet(detId);}}}><Ic n="del" s={12}/>Elim.</Btn></td>
                </tr>);
              })}
              {facturas.length===0&&<tr><td colSpan={9} style={{textAlign:"center",padding:16,color:"#ffffff"}}>Sin facturas registradas</td></tr>}
              </tbody>
            </table>
          </Card>
        </>}

        {tab==="pagos"&&<>
          <div style={{display:"flex",justifyContent:"flex-end",marginBottom:8}}>
            <Btn v="g" sx={{padding:"5px 12px",fontSize:10}} onClick={()=>{setPagoForm({fecha:todayStr(),monto:"",descuento_pct:"",tipo:"efectivo",factura:"",es_blanco:true,notas:""});setPagoModal(true);}}><Ic n="plus" s={12}/>Registrar Pago</Btn>
          </div>
          <Card sx={{overflow:"hidden",maxHeight:300,overflowY:"auto"}}>
            <table><thead><tr><th>Fecha</th><th>Monto</th><th>Tipo</th><th>Ref. Factura</th><th>Modalidad</th><th>Notas</th><th></th></tr></thead>
              <tbody>{pagos.map(pg=>(<tr key={pg.id}>
                <td style={{fontSize:11}}>{pg.fecha}</td>
                <td style={{color:"#00cc55",fontWeight:700}}>{fmtM(pg.monto)}</td>
                <td><Chip t={pg.tipo}/></td>
                <td style={{fontSize:11,color:"#ffffff"}}>{pg.factura||"—"}</td>
                <td><span style={{fontSize:9,fontWeight:700,padding:"2px 6px",borderRadius:8,background:pg.es_blanco?"#021520":"#0a0800",color:pg.es_blanco?"#00d4ff":"#ff9900"}}>{pg.es_blanco?"⬜ BLANCO":"⬛ NEGRO"}</span></td>
                <td style={{fontSize:10,color:"#ffffff"}}>{pg.notas||"—"}</td>
                <td><Btn v="r" sx={{padding:"2px 5px",fontSize:8}} onClick={async()=>{await sb.from("gp_prov_pagos").delete().eq("id",pg.id);loadDet(detId);notify("Pago eliminado");}}><Ic n="del" s={10}/></Btn></td>
              </tr>))}
              {pagos.length===0&&<tr><td colSpan={7} style={{textAlign:"center",padding:16,color:"#ffffff"}}>Sin pagos registrados</td></tr>}
              </tbody>
            </table>
          </Card>
        </>}
      </div></Modal>}

      {/* Modal nueva factura */}
      {factModal&&factForm&&<Modal close={()=>setFactModal(false)} w={480}><div style={{padding:22}}>
        <h2 style={{margin:"0 0 14px",fontSize:15,fontWeight:800}}>Cargar Factura — {detProv?.nombre}</h2>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:11}}>
          <div><Lbl t="Fecha factura"/><Inp type="date" value={factForm.fecha} onChange={(e)=>setFactForm(f=>({...f,fecha:e.target.value}))}/></div>
          <div><Lbl t="Fecha vencimiento"/><Inp type="date" value={factForm.fecha_vencimiento||""} onChange={(e)=>setFactForm(f=>({...f,fecha_vencimiento:e.target.value}))}/></div>
          <div><Lbl t="Nº Factura"/><Inp value={factForm.numero||""} onChange={(e)=>setFactForm(f=>({...f,numero:e.target.value}))} placeholder="ej: A-0001-00012345"/></div>
          <div><Lbl t="Monto ($)"/><Inp type="number" step=".01" placeholder="0.00" value={factForm.monto} onChange={(e)=>setFactForm(f=>({...f,monto:e.target.value}))}/></div>
          <div style={{gridColumn:"1/-1"}}><Lbl t="Concepto / Descripción"/><Inp value={factForm.concepto||""} onChange={(e)=>setFactForm(f=>({...f,concepto:e.target.value}))} placeholder="ej: Compra alimentos perro - Marzo"/></div>
          <div style={{gridColumn:"1/-1",display:"flex",gap:16}}>
            <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}}><input type="radio" checked={factForm.es_blanco===true} onChange={()=>setFactForm(f=>({...f,es_blanco:true}))} style={{accentColor:"#00d4ff"}}/><span style={{color:"#00d4ff",fontSize:12,fontWeight:700}}>⬜ Factura en BLANCO</span></label>
            <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}}><input type="radio" checked={factForm.es_blanco===false} onChange={()=>setFactForm(f=>({...f,es_blanco:false}))} style={{accentColor:"#ff9900"}}/><span style={{color:"#ff9900",fontSize:12,fontWeight:700}}>⬛ En NEGRO</span></label>
          </div>
          <div style={{gridColumn:"1/-1"}}><Lbl t="Notas"/><Inp value={factForm.notas||""} onChange={(e)=>setFactForm(f=>({...f,notas:e.target.value}))}/></div>
        </div>
        <div style={{display:"flex",gap:9,marginTop:16,justifyContent:"flex-end"}}><Btn v="gh" onClick={()=>setFactModal(false)}>Cancelar</Btn><Btn v="or" onClick={saveFact} disabled={saving}>{saving?"Guardando...":"Cargar Factura"}</Btn></div>
      </div></Modal>}

      {/* Modal nuevo pago */}
      {pagoModal&&pagoForm&&<Modal close={()=>setPagoModal(false)} w={440}><div style={{padding:22}}>
        <h2 style={{margin:"0 0 14px",fontSize:15,fontWeight:800}}>Confirmar Pago — {detProv?.nombre}</h2>
        <div style={{background:"#040c16",borderRadius:8,padding:"12px 14px",marginBottom:14}}>
          <div style={{fontSize:11,color:"#ffffff",marginBottom:6}}>Facturas a saldar:</div>
          {selectedFacts.map(f=><div key={f.id} style={{display:"flex",justifyContent:"space-between",fontSize:11,padding:"3px 0",borderBottom:"1px solid #192a3820"}}><span style={{color:"#ffffff"}}>{f.numero||`Fact. #${f.id}`}{f.concepto?` · ${f.concepto}`:""}</span><span style={{color:"#ff9900",fontWeight:700}}>{fmtM(f.monto)}</span></div>)}
          <div style={{display:"flex",justifyContent:"space-between",paddingTop:8,marginTop:4,borderTop:"1px solid #192a38"}}>
            <span style={{color:"#ffffff",fontWeight:700}}>Subtotal</span>
            <span style={{color:"#ff9900",fontWeight:700}}>{fmtM(selectedFacts.reduce((a,b)=>a+Number(b.monto),0))}</span>
          </div>
          {(parseFloat(descuentoPct)||0)>0&&<>
            <div style={{display:"flex",justifyContent:"space-between",paddingTop:4,fontSize:11}}><span style={{color:"#00cc55"}}>Descuento {descuentoPct}%</span><span style={{color:"#00cc55"}}>- {fmtM(selectedFacts.reduce((a,b)=>a+Number(b.monto),0)*(parseFloat(descuentoPct)||0)/100)}</span></div>
            <div style={{display:"flex",justifyContent:"space-between",paddingTop:6,fontWeight:900,fontSize:15,borderTop:"1px solid #192a38",marginTop:4}}><span style={{color:"#ffffff"}}>TOTAL A PAGAR</span><span style={{color:"#00cc55"}}>{fmtM(selectedFacts.reduce((a,b)=>a+Number(b.monto),0)*(1-(parseFloat(descuentoPct)||0)/100))}</span></div>
          </>}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:11}}>
          <div><Lbl t="Fecha"/><Inp type="date" value={pagoForm.fecha} onChange={(e)=>setPagoForm(f=>({...f,fecha:e.target.value}))}/></div>
          <div style={{background:"#030810",border:"1px solid #192a38",borderRadius:7,padding:"10px 12px"}}><div style={{fontSize:9,color:"#ffffff",marginBottom:3}}>FORMA DE PAGO</div><div style={{fontSize:14,fontWeight:700,color:"#00cc55",textTransform:"capitalize"}}>💳 {tipoPagoPanel}</div></div>
          <div style={{gridColumn:"1/-1",display:"flex",gap:16}}>
            <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}}><input type="radio" checked={pagoForm.es_blanco===true} onChange={()=>setPagoForm(f=>({...f,es_blanco:true}))} style={{accentColor:"#00d4ff"}}/><span style={{color:"#00d4ff",fontSize:12,fontWeight:700}}>⬜ BLANCO</span></label>
            <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}}><input type="radio" checked={pagoForm.es_blanco===false} onChange={()=>setPagoForm(f=>({...f,es_blanco:false}))} style={{accentColor:"#ff9900"}}/><span style={{color:"#ff9900",fontSize:12,fontWeight:700}}>⬛ NEGRO</span></label>
          </div>
          <div style={{gridColumn:"1/-1"}}><Lbl t="Notas"/><Inp value={pagoForm.notas||""} onChange={(e)=>setPagoForm(f=>({...f,notas:e.target.value}))}/></div>
        </div>
        <div style={{display:"flex",gap:9,marginTop:16,justifyContent:"flex-end"}}><Btn v="gh" onClick={()=>setPagoModal(false)}>Cancelar</Btn><Btn v="g" onClick={savePago} disabled={saving}>{saving?"Guardando...":"✓ Registrar Pago"}</Btn></div>
      </div></Modal>}

      {confirmDel&&<Modal close={()=>setConfirmDel(null)} w={360}><div style={{padding:24,textAlign:"center"}}><div style={{fontSize:36,marginBottom:12}}>⚠️</div><h2 style={{margin:"0 0 8px",fontSize:16,fontWeight:800}}>¿Eliminar proveedor?</h2><p style={{color:"#ffffff",fontSize:13,marginBottom:20}}>{confirmDel.nombre}</p><div style={{display:"flex",gap:10,justifyContent:"center"}}><Btn v="gh" onClick={()=>setConfirmDel(null)}>Cancelar</Btn><Btn v="r" onClick={()=>del(confirmDel.id)}><Ic n="del" s={13}/>Eliminar</Btn></div></div></Modal>}
    </div>
  );
}

// ─── EMPLEADOS ─────────────────────────────────────────────────────────────

function Empleados({notify}) {
  const[emps,setEmps]=useState([]);
  const[loading,setLoading]=useState(true);
  const[modal,setModal]=useState(false);
  const[form,setForm]=useState(null);
  const[saving,setSaving]=useState(false);
  const[detId,setDetId]=useState(null);
  const[pagos,setPagos]=useState([]);
  const[vacs,setVacs]=useState([]);
  const[pagoModal,setPagoModal]=useState(false);
  const[vacModal,setVacModal]=useState(false);
  const[pagoForm,setPagoForm]=useState(null);
  const[vacForm,setVacForm]=useState(null);
  const[tab,setTab]=useState("pagos");
  const[confirmDel,setConfirmDel]=useState(null);

  const load=async()=>{
    setLoading(true);
    const{data}=await sb.from("gp_empleados").select("*").order("nombre");
    setEmps(data||[]);
    setLoading(false);
  };

  const loadDet=async(id)=>{
    const[pg,vc]=await Promise.all([
      sb.from("gp_emp_pagos").select("*").eq("empleado_id",id).order("fecha",{ascending:false}),
      sb.from("gp_emp_vacaciones").select("*").eq("empleado_id",id).order("fecha_desde",{ascending:false}),
    ]);
    setPagos(pg.data||[]);
    setVacs(vc.data||[]);
  };

  useEffect(()=>{load();},[]);

  const openNew=()=>{setForm({nombre:"",dni:"",direccion:"",celular:"",fecha_ingreso:todayStr(),cargo:"",sueldo_base:0,activo:true,notas:""});setModal(true);};
  const openEdit=(e)=>{setForm({...e});setModal(true);};

  const save=async()=>{
    if(!form.nombre.trim()){notify("Nombre requerido","err");return;}
    setSaving(true);
    try{
      if(form.id) await sb.from("gp_empleados").update({nombre:form.nombre,dni:form.dni,direccion:form.direccion,celular:form.celular,fecha_ingreso:form.fecha_ingreso,cargo:form.cargo,sueldo_base:parseFloat(form.sueldo_base)||0,activo:form.activo,notas:form.notas}).eq("id",form.id);
      else await sb.from("gp_empleados").insert([{nombre:form.nombre,dni:form.dni,direccion:form.direccion,celular:form.celular,fecha_ingreso:form.fecha_ingreso,cargo:form.cargo,sueldo_base:parseFloat(form.sueldo_base)||0,activo:form.activo!==false,notas:form.notas}]);
      notify(form.id?"Empleado actualizado":"Empleado creado");setModal(false);load();
    }catch(e){notify("Error","err");}
    setSaving(false);
  };

  const del=async(id)=>{await sb.from("gp_empleados").delete().eq("id",id);notify("Eliminado");setConfirmDel(null);load();};

  const savePago=async()=>{
    if(!pagoForm.monto||parseFloat(pagoForm.monto)<=0){notify("Monto inválido","err");return;}
    setSaving(true);
    try{
      await sb.from("gp_emp_pagos").insert([{empleado_id:detId,fecha:pagoForm.fecha,monto:parseFloat(pagoForm.monto),tipo:pagoForm.tipo,notas:pagoForm.notas}]);
      notify("Pago registrado");setPagoModal(false);loadDet(detId);
    }catch(e){notify("Error","err");}
    setSaving(false);
  };

  const saveVac=async()=>{
    if(!vacForm.fecha_desde||!vacForm.fecha_hasta){notify("Fechas requeridas","err");return;}
    setSaving(true);
    try{
      const dias=Math.round((new Date(vacForm.fecha_hasta)-new Date(vacForm.fecha_desde))/(1000*60*60*24))+1;
      await sb.from("gp_emp_vacaciones").insert([{empleado_id:detId,fecha_desde:vacForm.fecha_desde,fecha_hasta:vacForm.fecha_hasta,dias,notas:vacForm.notas}]);
      notify("Vacaciones registradas");setVacModal(false);loadDet(detId);
    }catch(e){notify("Error","err");}
    setSaving(false);
  };

  const detEmp=emps.find(e=>e.id===detId);
  const totalPagos=pagos.reduce((a,b)=>a+Number(b.monto),0);
  const totalVacDias=vacs.reduce((a,b)=>a+Number(b.dias||0),0);
  const diasDesdeIngreso=detEmp?.fecha_ingreso?Math.round((new Date()-new Date(detEmp.fecha_ingreso))/(1000*60*60*24)):0;

  return(
    <div className="fade">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div><h1 style={{fontSize:18,fontWeight:800,margin:0}}>Empleados</h1><p style={{color:"#ffffff",fontSize:9,margin:"3px 0 0",letterSpacing:2.5}}>{emps.length} REGISTROS</p></div>
        <Btn v="g" onClick={openNew}><Ic n="plus" s={13}/>Nuevo</Btn>
      </div>

      {loading&&<div style={{padding:20,textAlign:"center",color:"#ffffff"}}>Cargando...</div>}
      {!loading&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:12}}>
        {emps.map(e=>{
          const dias=e.fecha_ingreso?Math.round((new Date()-new Date(e.fecha_ingreso))/(1000*60*60*24)):0;
          const anios=Math.floor(dias/365);
          const meses=Math.floor((dias%365)/30);
          return(<Card key={e.id} sx={{padding:16}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
              <div>
                <div style={{fontSize:14,fontWeight:800,color:"#ffffff"}}>{e.nombre}</div>
                <div style={{fontSize:10,color:"#ffffff",marginTop:2}}>{e.cargo||"Sin cargo"}</div>
                <div style={{fontSize:9,color:"#00d4ff",marginTop:2}}>Ingresó: {e.fecha_ingreso} · {anios>0?`${anios}a `:""}{meses>0?`${meses}m`:""} de antigüedad</div>
              </div>
              <span style={{fontSize:9,fontWeight:700,padding:"2px 8px",borderRadius:10,background:e.activo?"#021408":"#130900",color:e.activo?"#00cc55":"#ff9900",border:`1px solid ${e.activo?"#00882233":"#ff990033"}`}}>{e.activo?"ACTIVO":"INACTIVO"}</span>
            </div>
            <div style={{fontSize:11,color:"#ffffff",marginBottom:8}}>
              {e.dni&&<div>DNI: {e.dni}</div>}
              {e.celular&&<div>📱 {e.celular}</div>}
              {e.sueldo_base>0&&<div style={{color:"#00cc55",fontWeight:700}}>Sueldo base: {fmtM(e.sueldo_base)}</div>}
            </div>
            <div style={{display:"flex",gap:5}}>
              <Btn v="cy" sx={{flex:1,justifyContent:"center",fontSize:9,padding:"4px"}} onClick={()=>{setDetId(e.id);setTab("pagos");loadDet(e.id);}}><Ic n="cash" s={11}/>Cuenta</Btn>
              <Btn v="gh" sx={{padding:"4px 8px",fontSize:9}} onClick={()=>openEdit(e)}><Ic n="edit" s={11}/></Btn>
              <Btn v="r" sx={{padding:"4px 8px",fontSize:9}} onClick={()=>setConfirmDel(e)}><Ic n="del" s={11}/></Btn>
            </div>
          </Card>);
        })}
        {emps.length===0&&<div style={{color:"#ffffff",fontSize:12,padding:20}}>No hay empleados. Creá el primero.</div>}
      </div>}

      {/* Modal nuevo/editar empleado */}
      {modal&&form&&<Modal close={()=>setModal(false)} w={580}><div style={{padding:22}}>
        <h2 style={{margin:"0 0 16px",fontSize:15,fontWeight:800}}>{form.id?"Editar":"Nuevo"} Empleado</h2>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:11}}>
          <div style={{gridColumn:"1/-1"}}><Lbl t="Nombre completo"/><Inp value={form.nombre} onChange={(e)=>setForm(f=>({...f,nombre:e.target.value}))}/></div>
          <div><Lbl t="DNI"/><Inp value={form.dni||""} onChange={(e)=>setForm(f=>({...f,dni:e.target.value}))}/></div>
          <div><Lbl t="Celular"/><Inp value={form.celular||""} onChange={(e)=>setForm(f=>({...f,celular:e.target.value}))}/></div>
          <div style={{gridColumn:"1/-1"}}><Lbl t="Dirección"/><Inp value={form.direccion||""} onChange={(e)=>setForm(f=>({...f,direccion:e.target.value}))}/></div>
          <div><Lbl t="Cargo"/><Inp value={form.cargo||""} onChange={(e)=>setForm(f=>({...f,cargo:e.target.value}))} placeholder="ej: Vendedor, Encargado..."/></div>
          <div><Lbl t="Fecha de ingreso"/><Inp type="date" value={form.fecha_ingreso||""} onChange={(e)=>setForm(f=>({...f,fecha_ingreso:e.target.value}))}/></div>
          <div><Lbl t="Sueldo base ($)"/><Inp type="number" step=".01" value={form.sueldo_base||0} onChange={(e)=>setForm(f=>({...f,sueldo_base:e.target.value}))}/></div>
          <div style={{display:"flex",alignItems:"center",gap:8,paddingTop:20}}><input type="checkbox" checked={form.activo!==false} onChange={(e)=>setForm(f=>({...f,activo:e.target.checked}))} style={{accentColor:"#00cc55"}}/><span style={{fontSize:12,color:"#ffffff"}}>Activo</span></div>
          <div style={{gridColumn:"1/-1"}}><Lbl t="Notas"/><textarea value={form.notas||""} onChange={(e)=>setForm(f=>({...f,notas:e.target.value}))} style={{background:"#060f1a",border:"1px solid #192a38",color:"#ffffff",padding:"9px 12px",borderRadius:6,fontFamily:"inherit",fontSize:13,width:"100%",resize:"vertical",minHeight:60,outline:"none",boxSizing:"border-box"}}/></div>
        </div>
        <div style={{display:"flex",gap:9,marginTop:16,justifyContent:"flex-end"}}><Btn v="gh" onClick={()=>setModal(false)}>Cancelar</Btn><Btn v="g" onClick={save} disabled={saving}>{saving?"Guardando...":"Guardar"}</Btn></div>
      </div></Modal>}

      {/* Modal cuenta empleado */}
      {detId&&detEmp&&<Modal close={()=>setDetId(null)} w={640}><div style={{padding:22}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div>
            <h2 style={{margin:0,fontSize:16,fontWeight:800}}>{detEmp.nombre}</h2>
            <div style={{fontSize:10,color:"#ffffff",marginTop:3}}>{detEmp.cargo} · {detEmp.celular&&`📱 ${detEmp.celular}`} · Antigüedad: {Math.floor(diasDesdeIngreso/365)}a {Math.floor((diasDesdeIngreso%365)/30)}m</div>
          </div>
          <Btn v="gh" sx={{padding:"3px 8px"}} onClick={()=>setDetId(null)}><Ic n="x" s={13}/></Btn>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:14}}>
          <div style={{background:"#021408",border:"1px solid #00882233",borderRadius:8,padding:"10px 12px",textAlign:"center"}}><div style={{fontSize:9,color:"#ffffff",letterSpacing:1,marginBottom:4}}>SUELDO BASE</div><div style={{fontSize:16,fontWeight:800,color:"#00cc55"}}>{fmtM(detEmp.sueldo_base||0)}</div></div>
          <div style={{background:"#021408",border:"1px solid #00882233",borderRadius:8,padding:"10px 12px",textAlign:"center"}}><div style={{fontSize:9,color:"#ffffff",letterSpacing:1,marginBottom:4}}>TOTAL PAGADO</div><div style={{fontSize:16,fontWeight:800,color:"#00cc55"}}>{fmtM(totalPagos)}</div></div>
          <div style={{background:"#021520",border:"1px solid #00d4ff33",borderRadius:8,padding:"10px 12px",textAlign:"center"}}><div style={{fontSize:9,color:"#ffffff",letterSpacing:1,marginBottom:4}}>DÍAS VACACIONES</div><div style={{fontSize:16,fontWeight:800,color:"#00d4ff"}}>{totalVacDias}d</div></div>
        </div>
        <div style={{display:"flex",gap:8,marginBottom:12}}>
          <button onClick={()=>setTab("pagos")} style={{flex:1,padding:"7px 0",borderRadius:6,border:`1px solid ${tab==="pagos"?"#00cc55":"#192a38"}`,background:tab==="pagos"?"#021408":"transparent",color:tab==="pagos"?"#00cc55":"#ffffff",cursor:"pointer",fontFamily:"inherit",fontSize:11,fontWeight:700}}>💰 Pagos ({pagos.length})</button>
          <button onClick={()=>setTab("vacaciones")} style={{flex:1,padding:"7px 0",borderRadius:6,border:`1px solid ${tab==="vacaciones"?"#00d4ff":"#192a38"}`,background:tab==="vacaciones"?"#021520":"transparent",color:tab==="vacaciones"?"#00d4ff":"#ffffff",cursor:"pointer",fontFamily:"inherit",fontSize:11,fontWeight:700}}>🏖️ Vacaciones ({vacs.length})</button>
        </div>
        {tab==="pagos"&&<>
          <div style={{display:"flex",justifyContent:"flex-end",marginBottom:8}}>
            <Btn v="g" sx={{padding:"5px 12px",fontSize:10}} onClick={()=>{setPagoForm({fecha:todayStr(),monto:"",tipo:"sueldo",notas:""});setPagoModal(true);}}><Ic n="plus" s={12}/>Registrar Pago</Btn>
          </div>
          <Card sx={{overflow:"hidden",maxHeight:280,overflowY:"auto"}}>
            <table><thead><tr><th>Fecha</th><th>Monto</th><th>Tipo</th><th>Notas</th><th></th></tr></thead>
              <tbody>{pagos.map(pg=>(<tr key={pg.id}>
                <td style={{fontSize:11}}>{pg.fecha}</td>
                <td style={{color:"#00cc55",fontWeight:700}}>{fmtM(pg.monto)}</td>
                <td><span style={{fontSize:9,fontWeight:700,padding:"2px 7px",borderRadius:10,background:pg.tipo==="sueldo"?"#021408":pg.tipo==="premio"?"#140800":"#030810",color:pg.tipo==="sueldo"?"#00cc55":pg.tipo==="premio"?"#ff9900":"#3388ff",border:"1px solid #19293820"}}>{pg.tipo==="sueldo"?"💼 Sueldo":pg.tipo==="premio"?"🏆 Premio":"💸 "+pg.tipo}</span></td>
                <td style={{fontSize:10,color:"#ffffff"}}>{pg.notas||"—"}</td>
                <td><Btn v="r" sx={{padding:"2px 5px",fontSize:8}} onClick={async()=>{await sb.from("gp_emp_pagos").delete().eq("id",pg.id);loadDet(detId);}}><Ic n="del" s={10}/></Btn></td>
              </tr>))}
              {pagos.length===0&&<tr><td colSpan={5} style={{textAlign:"center",padding:16,color:"#ffffff"}}>Sin pagos registrados</td></tr>}
              </tbody>
            </table>
          </Card>
        </>}
        {tab==="vacaciones"&&<>
          <div style={{display:"flex",justifyContent:"flex-end",marginBottom:8}}>
            <Btn v="cy" sx={{padding:"5px 12px",fontSize:10}} onClick={()=>{setVacForm({fecha_desde:todayStr(),fecha_hasta:todayStr(),notas:""});setVacModal(true);}}><Ic n="plus" s={12}/>Registrar Vacaciones</Btn>
          </div>
          <Card sx={{overflow:"hidden",maxHeight:280,overflowY:"auto"}}>
            <table><thead><tr><th>Desde</th><th>Hasta</th><th>Días</th><th>Notas</th><th></th></tr></thead>
              <tbody>{vacs.map(v=>(<tr key={v.id}>
                <td style={{fontSize:11}}>{v.fecha_desde}</td>
                <td style={{fontSize:11}}>{v.fecha_hasta}</td>
                <td style={{color:"#00d4ff",fontWeight:700}}>{v.dias}d</td>
                <td style={{fontSize:10,color:"#ffffff"}}>{v.notas||"—"}</td>
                <td><Btn v="r" sx={{padding:"2px 5px",fontSize:8}} onClick={async()=>{await sb.from("gp_emp_vacaciones").delete().eq("id",v.id);loadDet(detId);}}><Ic n="del" s={10}/></Btn></td>
              </tr>))}
              {vacs.length===0&&<tr><td colSpan={5} style={{textAlign:"center",padding:16,color:"#ffffff"}}>Sin vacaciones registradas</td></tr>}
              </tbody>
            </table>
          </Card>
        </>}
      </div></Modal>}

      {/* Modal pago empleado */}
      {pagoModal&&pagoForm&&<Modal close={()=>setPagoModal(false)} w={400}><div style={{padding:22}}>
        <h2 style={{margin:"0 0 14px",fontSize:15,fontWeight:800}}>Registrar Pago — {detEmp?.nombre}</h2>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:11}}>
          <div><Lbl t="Fecha"/><Inp type="date" value={pagoForm.fecha} onChange={(e)=>setPagoForm(f=>({...f,fecha:e.target.value}))}/></div>
          <div><Lbl t="Monto ($)"/><Inp type="number" step=".01" placeholder="0.00" value={pagoForm.monto} onChange={(e)=>setPagoForm(f=>({...f,monto:e.target.value}))}/></div>
          <div style={{gridColumn:"1/-1"}}><Lbl t="Tipo"/><Sel value={pagoForm.tipo} onChange={(e)=>setPagoForm(f=>({...f,tipo:e.target.value}))}><option value="sueldo">💼 Sueldo</option><option value="premio">🏆 Premio / Extra</option><option value="adelanto">💸 Adelanto</option><option value="otro">Otro</option></Sel></div>
          <div style={{gridColumn:"1/-1"}}><Lbl t="Notas"/><Inp value={pagoForm.notas||""} onChange={(e)=>setPagoForm(f=>({...f,notas:e.target.value}))}/></div>
        </div>
        <div style={{display:"flex",gap:9,marginTop:16,justifyContent:"flex-end"}}><Btn v="gh" onClick={()=>setPagoModal(false)}>Cancelar</Btn><Btn v="g" onClick={savePago} disabled={saving}>{saving?"Guardando...":"Registrar"}</Btn></div>
      </div></Modal>}

      {/* Modal vacaciones */}
      {vacModal&&vacForm&&<Modal close={()=>setVacModal(false)} w={400}><div style={{padding:22}}>
        <h2 style={{margin:"0 0 14px",fontSize:15,fontWeight:800}}>Registrar Vacaciones — {detEmp?.nombre}</h2>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:11}}>
          <div><Lbl t="Desde"/><Inp type="date" value={vacForm.fecha_desde} onChange={(e)=>setVacForm(f=>({...f,fecha_desde:e.target.value}))}/></div>
          <div><Lbl t="Hasta"/><Inp type="date" value={vacForm.fecha_hasta} onChange={(e)=>setVacForm(f=>({...f,fecha_hasta:e.target.value}))}/></div>
          {vacForm.fecha_desde&&vacForm.fecha_hasta&&<div style={{gridColumn:"1/-1",background:"#021520",border:"1px solid #00d4ff33",borderRadius:6,padding:"8px 12px",fontSize:11,color:"#00d4ff"}}>{Math.round((new Date(vacForm.fecha_hasta)-new Date(vacForm.fecha_desde))/(1000*60*60*24))+1} días de vacaciones</div>}
          <div style={{gridColumn:"1/-1"}}><Lbl t="Notas"/><Inp value={vacForm.notas||""} onChange={(e)=>setVacForm(f=>({...f,notas:e.target.value}))}/></div>
        </div>
        <div style={{display:"flex",gap:9,marginTop:16,justifyContent:"flex-end"}}><Btn v="gh" onClick={()=>setVacModal(false)}>Cancelar</Btn><Btn v="cy" onClick={saveVac} disabled={saving}>{saving?"Guardando...":"Registrar"}</Btn></div>
      </div></Modal>}

      {confirmDel&&<Modal close={()=>setConfirmDel(null)} w={360}><div style={{padding:24,textAlign:"center"}}><div style={{fontSize:36,marginBottom:12}}>⚠️</div><h2 style={{margin:"0 0 8px",fontSize:16,fontWeight:800}}>¿Eliminar empleado?</h2><p style={{color:"#ffffff",fontSize:13,marginBottom:20}}>{confirmDel.nombre}</p><div style={{display:"flex",gap:10,justifyContent:"center"}}><Btn v="gh" onClick={()=>setConfirmDel(null)}>Cancelar</Btn><Btn v="r" onClick={()=>del(confirmDel.id)}><Ic n="del" s={13}/>Eliminar</Btn></div></div></Modal>}
    </div>
  );
}


// ─── GASTOS GENERALES ──────────────────────────────────────────────────────

const CATEGORIAS_GASTO=["Alquiler","Servicios","Impuestos","Sueldos","Publicidad","Mantenimiento","Transporte","Otros"];
const CAT_COLORS_G={"Alquiler":"#ff6666","Servicios":"#ff9900","Impuestos":"#ff4444","Sueldos":"#cc44ff","Publicidad":"#3388ff","Mantenimiento":"#ffaa00","Transporte":"#00d4ff","Otros":"#8ab4c8"};

function Gastos({notify}) {
  const[gastos,setGastos]=useState([]);
  const[loading,setLoading]=useState(true);
  const[modal,setModal]=useState(false);
  const[form,setForm]=useState(null);
  const[saving,setSaving]=useState(false);
  const[mesF,setMesF]=useState(new Date().toISOString().slice(0,7));
  const[confirmDel,setConfirmDel]=useState(null);
  const fmtMonth=(ym)=>{const[y,m]=ym.split("-");const n=["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];return`${n[parseInt(m)-1]} ${y}`;};
  const load=async()=>{
    setLoading(true);
    const{data}=await sb.from("gp_gastos").select("*").gte("fecha",`${mesF}-01`).lte("fecha",`${mesF}-31`).order("fecha",{ascending:false});
    setGastos(data||[]);setLoading(false);
  };
  useEffect(()=>{load();},[mesF]);
  const openNew=()=>{setForm({fecha:todayStr(),categoria:"Alquiler",descripcion:"",monto:"",tipo_pago:"efectivo",notas:""});setModal(true);};
  const save=async()=>{
    if(!form.monto||parseFloat(form.monto)<=0){notify("Monto inválido","err");return;}
    if(!form.descripcion.trim()){notify("Descripción requerida","err");return;}
    setSaving(true);
    try{
      if(form.id) await sb.from("gp_gastos").update({fecha:form.fecha,categoria:form.categoria,descripcion:form.descripcion,monto:parseFloat(form.monto),tipo_pago:form.tipo_pago,notas:form.notas}).eq("id",form.id);
      else await sb.from("gp_gastos").insert([{fecha:form.fecha,categoria:form.categoria,descripcion:form.descripcion,monto:parseFloat(form.monto),tipo_pago:form.tipo_pago,notas:form.notas}]);
      notify(form.id?"Gasto actualizado":"Gasto registrado");setModal(false);load();
    }catch(e){notify("Error","err");}
    setSaving(false);
  };
  const del=async(id)=>{await sb.from("gp_gastos").delete().eq("id",id);notify("Eliminado");setConfirmDel(null);load();};
  const totalMes=gastos.reduce((a,b)=>a+Number(b.monto),0);
  const porCat=CATEGORIAS_GASTO.map(c=>({cat:c,total:gastos.filter(g=>g.categoria===c).reduce((a,b)=>a+Number(b.monto),0)})).filter(c=>c.total>0).sort((a,b)=>b.total-a.total);
  return(
    <div className="fade">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div><h1 style={{fontSize:18,fontWeight:800,margin:0}}>Gastos Generales</h1><p style={{color:"#ffffff",fontSize:9,margin:"3px 0 0",letterSpacing:2.5}}>EGRESOS · ALQUILERES · SERVICIOS · IMPUESTOS</p></div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <Inp type="month" value={mesF} onChange={(e)=>setMesF(e.target.value)} sx={{width:160}}/>
          <Btn v="g" onClick={openNew}><Ic n="plus" s={13}/>Nuevo Gasto</Btn>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
        <Card sx={{padding:18}}>
          <div style={{fontSize:9,color:"#ffffff",letterSpacing:2,marginBottom:6}}>TOTAL EGRESOS · {fmtMonth(mesF)}</div>
          <div style={{fontSize:28,fontWeight:900,color:"#ff4444"}}>{fmtM(totalMes)}</div>
          <div style={{fontSize:10,color:"#ffffff",marginTop:4}}>{gastos.length} gastos registrados</div>
        </Card>
        <Card sx={{padding:18}}>
          <div style={{fontSize:9,color:"#ffffff",letterSpacing:2,marginBottom:8}}>POR CATEGORÍA</div>
          {porCat.slice(0,6).map(c=>(
            <div key={c.cat} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
              <span style={{fontSize:11,color:CAT_COLORS_G[c.cat]||"#ffffff"}}>{c.cat}</span>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{width:60,height:4,background:"#192a38",borderRadius:2,overflow:"hidden"}}><div style={{height:"100%",background:CAT_COLORS_G[c.cat]||"#ffffff",width:`${totalMes>0?c.total/totalMes*100:0}%`,borderRadius:2}}/></div>
                <span style={{fontSize:11,fontWeight:700,color:CAT_COLORS_G[c.cat]||"#ffffff",minWidth:90,textAlign:"right"}}>{fmtM(c.total)}</span>
              </div>
            </div>
          ))}
          {porCat.length===0&&<div style={{fontSize:11,color:"#ffffff"}}>Sin gastos este mes</div>}
        </Card>
      </div>
      {loading&&<div style={{padding:20,textAlign:"center",color:"#ffffff"}}>Cargando...</div>}
      {!loading&&<Card sx={{overflow:"hidden"}}>
        <table><thead><tr><th>Fecha</th><th>Categoría</th><th>Descripción</th><th>Monto</th><th>Pago</th><th>Notas</th><th></th></tr></thead>
          <tbody>{gastos.map(g=>(
            <tr key={g.id}>
              <td style={{fontSize:11}}>{g.fecha}</td>
              <td><span style={{fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:10,background:"#0b1825",color:CAT_COLORS_G[g.categoria]||"#ffffff",border:`1px solid ${CAT_COLORS_G[g.categoria]||"#ffffff"}33`}}>{g.categoria}</span></td>
              <td style={{fontWeight:600,color:"#ffffff"}}>{g.descripcion}</td>
              <td style={{color:"#ff6666",fontWeight:700,fontSize:13}}>{fmtM(g.monto)}</td>
              <td style={{fontSize:11,color:g.tipo_pago==="efectivo"?"#00cc55":"#3388ff"}}>{g.tipo_pago==="efectivo"?"💵":"🏦"} {g.tipo_pago}</td>
              <td style={{fontSize:10,color:"#ffffff"}}>{g.notas||"—"}</td>
              <td><div style={{display:"flex",gap:4}}>
                <Btn v="gh" sx={{padding:"3px 6px",fontSize:9}} onClick={()=>{setForm({...g,monto:String(g.monto)});setModal(true);}}><Ic n="edit" s={11}/></Btn>
                <Btn v="r" sx={{padding:"3px 6px",fontSize:9}} onClick={()=>setConfirmDel(g)}><Ic n="del" s={11}/></Btn>
              </div></td>
            </tr>
          ))}
          {gastos.length===0&&<tr><td colSpan={7} style={{textAlign:"center",padding:20,color:"#ffffff"}}>Sin gastos registrados en {fmtMonth(mesF)}</td></tr>}
          </tbody>
        </table>
      </Card>}
      {modal&&form&&<Modal close={()=>setModal(false)} w={480}><div style={{padding:22}}>
        <h2 style={{margin:"0 0 16px",fontSize:15,fontWeight:800}}>{form.id?"Editar":"Nuevo"} Gasto</h2>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:11}}>
          <div><Lbl t="Fecha"/><Inp type="date" value={form.fecha} onChange={(e)=>setForm(f=>({...f,fecha:e.target.value}))}/></div>
          <div><Lbl t="Categoría"/><Sel value={form.categoria} onChange={(e)=>setForm(f=>({...f,categoria:e.target.value}))}>{CATEGORIAS_GASTO.map(c=><option key={c}>{c}</option>)}</Sel></div>
          <div style={{gridColumn:"1/-1"}}><Lbl t="Descripción"/><Inp value={form.descripcion} onChange={(e)=>setForm(f=>({...f,descripcion:e.target.value}))} placeholder="ej: Alquiler Cataluña Julio"/></div>
          <div><Lbl t="Monto ($)"/><Inp type="number" step=".01" placeholder="0.00" value={form.monto} onChange={(e)=>setForm(f=>({...f,monto:e.target.value}))}/></div>
          <div><Lbl t="Forma de pago"/>
            <div style={{display:"flex",gap:16,marginTop:8}}>
              {["efectivo","transferencia"].map(t=>(
                <label key={t} style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer"}}>
                  <input type="radio" checked={form.tipo_pago===t} onChange={()=>setForm(f=>({...f,tipo_pago:t}))} style={{accentColor:"#00cc55"}}/>
                  <span style={{fontSize:12,color:form.tipo_pago===t?"#00cc55":"#ffffff",fontWeight:form.tipo_pago===t?700:400}}>{t==="efectivo"?"💵 Efectivo":"🏦 Transferencia"}</span>
                </label>
              ))}
            </div>
          </div>
          <div style={{gridColumn:"1/-1"}}><Lbl t="Notas"/><Inp value={form.notas||""} onChange={(e)=>setForm(f=>({...f,notas:e.target.value}))}/></div>
        </div>
        <div style={{display:"flex",gap:9,marginTop:16,justifyContent:"flex-end"}}><Btn v="gh" onClick={()=>setModal(false)}>Cancelar</Btn><Btn v="r" onClick={save} disabled={saving}>{saving?"Guardando...":"Guardar Gasto"}</Btn></div>
      </div></Modal>}
      {confirmDel&&<Modal close={()=>setConfirmDel(null)} w={380}><div style={{padding:24,textAlign:"center"}}>
        <div style={{fontSize:36,marginBottom:12}}>⚠️</div>
        <h2 style={{margin:"0 0 8px",fontSize:16,fontWeight:800}}>¿Eliminar gasto?</h2>
        <p style={{color:"#ffffff",fontSize:13,marginBottom:4}}>{confirmDel.descripcion}</p>
        <p style={{color:"#ff6666",fontSize:14,fontWeight:700,marginBottom:20}}>{fmtM(confirmDel.monto)}</p>
        <div style={{display:"flex",gap:10,justifyContent:"center"}}><Btn v="gh" onClick={()=>setConfirmDel(null)}>Cancelar</Btn><Btn v="r" onClick={()=>del(confirmDel.id)}><Ic n="del" s={13}/>Eliminar</Btn></div>
      </div></Modal>}
    </div>
  );
}

// ─── REPORTE PROVEEDORES ───────────────────────────────────────────────────

function ReporteProveedores({sales}) {
  const[mes,setMes]=useState(new Date().toISOString().slice(0,7));
  const[pagos,setPagos]=useState([]);
  const[gastos,setGastos]=useState([]);
  const[pagoEmp,setPagoEmp]=useState([]);
  const[loading,setLoading]=useState(false);
  const fmtMonth=(ym)=>{const[y,m]=ym.split("-");const names=["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];return`${names[parseInt(m)-1]} ${y}`;};
  useEffect(()=>{
    const load=async()=>{
      setLoading(true);
      const desde=`${mes}-01`;const hasta=`${mes}-31`;
      const[pg,gs,pe]=await Promise.all([
        sb.from("gp_prov_pagos").select("*,gp_proveedores(nombre)").gte("fecha",desde).lte("fecha",hasta).order("fecha",{ascending:false}),
        sb.from("gp_gastos").select("*").gte("fecha",desde).lte("fecha",hasta),
        sb.from("gp_emp_pagos").select("*,gp_empleados(nombre)").gte("fecha",desde).lte("fecha",hasta),
      ]);
      setPagos(pg.data||[]);setGastos(gs.data||[]);setPagoEmp(pe.data||[]);setLoading(false);
    };
    load();
  },[mes]);

  const ventasMes=sales.filter(s=>s.date&&s.date.slice(0,7)===mes);
  const totalVentas=ventasMes.reduce((a,b)=>a+b.total,0);
  const ventasEf=ventasMes.filter(s=>s.pay==="efectivo").reduce((a,b)=>a+b.total,0);
  const ventasDig=ventasMes.filter(s=>s.pay==="tarjeta"||s.pay==="QR"||s.pay?.includes("+")).reduce((a,b)=>a+b.total,0);
  const totalProv=pagos.reduce((a,b)=>a+Number(b.monto),0);
  const totalEmp=pagoEmp.reduce((a,b)=>a+Number(b.monto),0);
  const totalGastos=gastos.reduce((a,b)=>a+Number(b.monto),0);
  const totalSalidas=totalProv+totalEmp+totalGastos;
  const neto=totalVentas-totalSalidas;
  const provEf=pagos.filter(p=>p.tipo==="efectivo").reduce((a,b)=>a+Number(b.monto),0);
  const provTr=pagos.filter(p=>p.tipo==="transferencia").reduce((a,b)=>a+Number(b.monto),0);
  const gastosPorCat={};
  gastos.forEach(g=>{gastosPorCat[g.categoria]=(gastosPorCat[g.categoria]||0)+Number(g.monto);});

  return(
    <div className="fade">
      <div style={{marginBottom:16}}>
        <h1 style={{fontSize:18,fontWeight:800,margin:0}}>Reporte Mensual · Entradas vs Salidas</h1>
        <p style={{color:"#ffffff",fontSize:9,margin:"3px 0 0",letterSpacing:2.5}}>RESULTADO REAL DEL MES · VENTAS − TODOS LOS GASTOS</p>
      </div>
      <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:16}}>
        <Inp type="month" value={mes} onChange={(e)=>setMes(e.target.value)} sx={{width:180}}/>
        <span style={{fontSize:13,fontWeight:700,color:"#00d4ff"}}>{fmtMonth(mes)}</span>
        {loading&&<span style={{fontSize:11,color:"#ffffff"}}>Cargando...</span>}
      </div>
      {/* Resultado grande */}
      <Card sx={{padding:20,marginBottom:14,background:neto>=0?"#021408":"#110305",border:`2px solid ${neto>=0?"#00882244":"#ff333344"}`}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16,alignItems:"center"}}>
          <div style={{textAlign:"center"}}><div style={{fontSize:9,color:"#ffffff",letterSpacing:2,marginBottom:6}}>TOTAL ENTRADAS</div><div style={{fontSize:24,fontWeight:900,color:"#00cc55"}}>{fmtM(totalVentas)}</div><div style={{fontSize:10,color:"#ffffff",marginTop:2}}>{ventasMes.length} ventas</div></div>
          <div style={{textAlign:"center"}}><div style={{fontSize:9,color:"#ffffff",letterSpacing:2,marginBottom:6}}>TOTAL SALIDAS</div><div style={{fontSize:24,fontWeight:900,color:"#ff4444"}}>{fmtM(totalSalidas)}</div><div style={{fontSize:10,color:"#ffffff",marginTop:2}}>prov + emp + gastos</div></div>
          <div style={{textAlign:"center"}}><div style={{fontSize:9,color:"#ffffff",letterSpacing:2,marginBottom:6}}>RESULTADO NETO</div><div style={{fontSize:28,fontWeight:900,color:neto>=0?"#00cc55":"#ff4444"}}>{fmtM(neto)}</div><div style={{fontSize:11,color:neto>=0?"#00cc55":"#ff4444",marginTop:2,fontWeight:700}}>{neto>=0?"✓ POSITIVO":"⚠ NEGATIVO"}</div></div>
        </div>
      </Card>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
        <Card sx={{padding:18}}>
          <div style={{fontSize:11,fontWeight:800,color:"#00cc55",marginBottom:12}}>📈 ENTRADAS — {fmtMonth(mes)}</div>
          <div style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid #192a38"}}><span style={{color:"#ffffff"}}>💵 Efectivo</span><span style={{color:"#00cc55",fontWeight:700}}>{fmtM(ventasEf)}</span></div>
          <div style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid #192a38"}}><span style={{color:"#ffffff"}}>🏦 Digital (QR / Tarjeta)</span><span style={{color:"#3388ff",fontWeight:700}}>{fmtM(ventasDig)}</span></div>
          {totalVentas-ventasEf-ventasDig>0&&<div style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid #192a38"}}><span style={{color:"#ffffff"}}>Mixtos</span><span style={{color:"#ffffff",fontWeight:700}}>{fmtM(totalVentas-ventasEf-ventasDig)}</span></div>}
          <div style={{display:"flex",justifyContent:"space-between",paddingTop:10,fontWeight:800,fontSize:14,borderTop:"1px solid #192a38",marginTop:4}}><span style={{color:"#ffffff"}}>TOTAL</span><span style={{color:"#00cc55"}}>{fmtM(totalVentas)}</span></div>
        </Card>
        <Card sx={{padding:18}}>
          <div style={{fontSize:11,fontWeight:800,color:"#ff4444",marginBottom:12}}>📉 SALIDAS — {fmtMonth(mes)}</div>
          <div style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid #192a38"}}><span style={{color:"#ffffff"}}>🏢 Proveedores ({pagos.length})</span><span style={{color:"#ff6666",fontWeight:700}}>{fmtM(totalProv)}</span></div>
          {provEf>0&&<div style={{display:"flex",justifyContent:"space-between",fontSize:10,padding:"3px 0 3px 12px"}}><span style={{color:"#ffffff"}}>└ 💵 Efectivo</span><span style={{color:"#ff9900"}}>{fmtM(provEf)}</span></div>}
          {provTr>0&&<div style={{display:"flex",justifyContent:"space-between",fontSize:10,padding:"3px 0 3px 12px",borderBottom:"1px solid #192a3820"}}><span style={{color:"#ffffff"}}>└ 🏦 Transferencia</span><span style={{color:"#ff9900"}}>{fmtM(provTr)}</span></div>}
          <div style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid #192a38"}}><span style={{color:"#ffffff"}}>👥 Empleados ({pagoEmp.length})</span><span style={{color:"#ff6666",fontWeight:700}}>{fmtM(totalEmp)}</span></div>
          <div style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid #192a38"}}><span style={{color:"#ffffff"}}>📋 Gastos generales ({gastos.length})</span><span style={{color:"#ff6666",fontWeight:700}}>{fmtM(totalGastos)}</span></div>
          {Object.entries(gastosPorCat).sort((a,b)=>b[1]-a[1]).map(([cat,monto])=>(
            <div key={cat} style={{display:"flex",justifyContent:"space-between",fontSize:10,padding:"2px 0 2px 12px"}}><span style={{color:"#ffffff"}}>└ {cat}</span><span style={{color:"#ff9900"}}>{fmtM(monto)}</span></div>
          ))}
          <div style={{display:"flex",justifyContent:"space-between",paddingTop:10,fontWeight:800,fontSize:14,borderTop:"1px solid #192a38",marginTop:4}}><span style={{color:"#ffffff"}}>TOTAL</span><span style={{color:"#ff4444"}}>{fmtM(totalSalidas)}</span></div>
        </Card>
      </div>
      {pagos.length>0&&<Card sx={{overflow:"hidden",marginBottom:14}}>
        <div style={{padding:"11px 16px",borderBottom:"1px solid #192a38"}}><span style={{fontSize:8,fontWeight:700,letterSpacing:2.5,color:"#ffffff",textTransform:"uppercase"}}>Pagos a Proveedores · {fmtMonth(mes)}</span></div>
        <table><thead><tr><th>Fecha</th><th>Proveedor</th><th>Monto</th><th>Tipo</th><th>Factura</th></tr></thead>
          <tbody>{pagos.map((p,i)=>(<tr key={i}><td style={{fontSize:11}}>{p.fecha}</td><td style={{fontWeight:700,color:"#ffffff"}}>{p.gp_proveedores?.nombre||"—"}</td><td style={{color:"#ff6666",fontWeight:700}}>{fmtM(p.monto)}</td><td style={{fontSize:11,color:p.tipo==="efectivo"?"#00cc55":"#3388ff"}}>{p.tipo==="efectivo"?"💵":"🏦"} {p.tipo}</td><td style={{fontSize:10,color:"#ffffff"}}>{p.factura||"—"}</td></tr>))}</tbody>
        </table>
      </Card>}
      {gastos.length>0&&<Card sx={{overflow:"hidden"}}>
        <div style={{padding:"11px 16px",borderBottom:"1px solid #192a38"}}><span style={{fontSize:8,fontWeight:700,letterSpacing:2.5,color:"#ffffff",textTransform:"uppercase"}}>Gastos Generales · {fmtMonth(mes)}</span></div>
        <table><thead><tr><th>Fecha</th><th>Categoría</th><th>Descripción</th><th>Monto</th><th>Pago</th></tr></thead>
          <tbody>{gastos.map((g,i)=>(<tr key={i}><td style={{fontSize:11}}>{g.fecha}</td><td style={{fontSize:10,color:"#ff9900",fontWeight:700}}>{g.categoria}</td><td style={{color:"#ffffff"}}>{g.descripcion}</td><td style={{color:"#ff6666",fontWeight:700}}>{fmtM(g.monto)}</td><td style={{fontSize:11,color:g.tipo_pago==="efectivo"?"#00cc55":"#3388ff"}}>{g.tipo_pago==="efectivo"?"💵":"🏦"} {g.tipo_pago}</td></tr>))}</tbody>
        </table>
      </Card>}
    </div>
  );
}

// ─── TRASLADOS ─────────────────────────────────────────────────────────────

function Traslados({prods,localeNames,notify,session,loadAll}) {
  const[origen,setOrigen]=useState("DEPOSITO");
  const[destino,setDestino]=useState("");
  const[items,setItems]=useState([]); // [{prodId, nombre, unit, cantidad}]
  const[prodId,setProdId]=useState("");
  const[cantidad,setCantidad]=useState("");
  const[q,setQ]=useState("");
  const[saving,setSaving]=useState(false);
  const[remitos,setRemitos]=useState([]); // historial agrupado por remito
  const[loadingHist,setLoadingHist]=useState(true);
  const[detRemito,setDetRemito]=useState(null); // remito abierto para ver detalle

  const loadHist=async()=>{
    setLoadingHist(true);
    const{data}=await sb.from("gp_stock_mov")
      .select("*").eq("tipo","traslado")
      .order("fecha",{ascending:false}).limit(500);
    // Agrupar por remito_id (guardamos en usuario como "remito:XXXXX origen→destino")
    const grupos={};
    (data||[]).forEach(m=>{
      // usuario format: "NOMBRE · remito:123456 · ORIGEN → DESTINO"
      const rMatch=m.usuario?.match(/remito:(\d+)/);
      const rId=rMatch?rMatch[1]:m.fecha;
      if(!grupos[rId]) grupos[rId]={id:rId,fecha:m.fecha,usuario:m.usuario,items:[],origen:"",destino:""};
      const arrow=m.usuario?.match(/·\s*(.+?)\s*→\s*(.+)$/);
      if(arrow){grupos[rId].origen=arrow[1].trim();grupos[rId].destino=arrow[2].trim();}
      // Solo incluir movimientos de entrada (cantidad>0) para el remito del destino
      if(m.cantidad>0) grupos[rId].items.push(m);
    });
    setRemitos(Object.values(grupos).sort((a,b)=>new Date(b.fecha).getTime()-new Date(a.fecha).getTime()));
    setLoadingHist(false);
  };

  useEffect(()=>{loadHist();},[]);

  const filtProds=prods.filter(p=>p.name.toLowerCase().includes(q.toLowerCase())||(p.code&&p.code.toLowerCase().includes(q.toLowerCase())));

  const agregarItem=()=>{
    if(!prodId){notify("Seleccioná un producto","err");return;}
    const qty=parseFloat(cantidad);
    if(!qty||qty<=0){notify("Ingresá una cantidad válida","err");return;}
    const prod=prods.find(p=>p.id===parseInt(prodId));
    if(!prod) return;
    if(items.find(i=>i.prodId===prod.id)){notify("Ese producto ya está en la lista","err");return;}
    setItems(prev=>[...prev,{prodId:prod.id,nombre:prod.name,code:prod.code,unit:prod.unit,cat:prod.cat,cantidad:qty}]);
    setProdId("");setCantidad("");setQ("");
  };

  const quitarItem=(pid)=>setItems(prev=>prev.filter(i=>i.prodId!==pid));

  const imprimirRemito=(remitoId,org,dest,fecha,itemsList)=>{
    const fechaStr=new Date(fecha).toLocaleString("es-AR",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit",hour12:false});
    const html=`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Remito #${remitoId}</title>
    <style>
      body{font-family:Arial,sans-serif;padding:30px;color:#000;max-width:700px;margin:0 auto}
      h1{font-size:20px;margin-bottom:4px;text-align:center}
      .sub{text-align:center;font-size:11px;color:#555;margin-bottom:16px}
      .remito-num{text-align:center;font-size:15px;font-weight:700;background:#f0f0f0;padding:8px;border-radius:4px;margin-bottom:16px}
      .grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:16px}
      .field{border:1px solid #ccc;border-radius:4px;padding:8px 12px}
      .field label{font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#888;display:block;margin-bottom:2px}
      .field span{font-size:13px;font-weight:700}
      table{width:100%;border-collapse:collapse;margin-bottom:20px}
      th{background:#1a1a2e;color:#fff;padding:6px 10px;text-align:left;font-size:10px;text-transform:uppercase}
      td{padding:8px 10px;border-bottom:1px solid #eee;font-size:12px}
      tr:nth-child(even) td{background:#fafafa}
      .cant{font-weight:900;color:#006600;font-size:14px}
      .check{width:18px;height:18px;border:2px solid #000;display:inline-block;border-radius:2px}
      .firma{display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-top:40px}
      .firma-box{border-top:2px solid #000;padding-top:8px;text-align:center;font-size:10px;color:#555}
      .no-print{text-align:center;margin-bottom:16px}
      @media print{.no-print{display:none}}
    </style></head><body>
    <div class="no-print">
      <button onclick="window.print()" style="background:#1a1a2e;color:#fff;border:none;padding:8px 20px;border-radius:5px;font-size:13px;cursor:pointer;margin-right:8px">🖨️ Imprimir Remito</button>
      <button onclick="window.close()" style="background:#666;color:#fff;border:none;padding:8px 14px;border-radius:5px;font-size:13px;cursor:pointer">✕ Cerrar</button>
    </div>
    <h1>🐾 Masc🐾tas Pet Shop</h1>
    <div class="sub">Remito de Traslado Interno</div>
    <div class="remito-num">Remito Nº ${remitoId} · ${fechaStr}</div>
    <div class="grid">
      <div class="field"><label>Origen</label><span>📦 ${org}</span></div>
      <div class="field"><label>Destino</label><span>📍 ${dest}</span></div>
      <div class="field"><label>Responsable</label><span>${session?.name||"Admin"}</span></div>
    </div>
    <table><thead><tr><th>✓</th><th>Código</th><th>Producto</th><th>Categoría</th><th>Cantidad</th></tr></thead><tbody>
    ${itemsList.map(it=>{
      const prod=prods.find(p=>p.id===(it.prodId||it.product_id));
      const nom=it.nombre||prod?.name||`#${it.prodId||it.product_id}`;
      const cat=it.cat||prod?.cat||"";
      const unit=it.unit||prod?.unit||"kg";
      const qty=it.cantidad||Math.abs(it.cantidad)||0;
      const qStr=unit==="kg"?fmtW(qty):`${qty} u`;
      return`<tr><td><div class="check"></div></td><td style="font-family:monospace;font-size:10px">${it.code||prod?.code||"—"}</td><td><strong>${nom}</strong></td><td>${cat}</td><td class="cant">${qStr}</td></tr>`;
    }).join("")}
    </tbody></table>
    <div style="font-size:11px;color:#555;border:1px solid #eee;border-radius:4px;padding:10px;margin-bottom:20px">
      ⚠ El local destino debe verificar la mercadería recibida y firmar conformidad antes de ingresar al depósito.
    </div>
    <div class="firma">
      <div class="firma-box">Entregó: ${org}<br><br><br><br>Firma y aclaración</div>
      <div class="firma-box">Recibió: ${dest}<br><br><br><br>Firma y aclaración</div>
    </div>
    </body></html>`;
    const win=window.open("","_blank");
    if(win){win.document.write(html);win.document.close();}
  };

  const confirmarTraslado=async()=>{
    if(!destino){notify("Seleccioná local destino","err");return;}
    if(origen===destino){notify("Origen y destino no pueden ser iguales","err");return;}
    if(items.length===0){notify("Agregá al menos un producto","err");return;}
    setSaving(true);
    const remitoId=Date.now().toString().slice(-8);
    const now=new Date().toISOString();
    const usuario=`${session?.name||"admin"} · remito:${remitoId} · ${origen} → ${destino}`;
    try{
      for(const it of items){
        // Leer stock origen
        const{data:sO}=await sb.from("gp_stock").select("*").eq("product_id",it.prodId).eq("local_name",origen).single();
        const stkO=sO?Number(sO.stk)||0:0;
        const nuevoO=stkO-it.cantidad;
        if(sO) await sb.from("gp_stock").update({stk:nuevoO}).eq("id",sO.id);
        else await sb.from("gp_stock").insert([{product_id:it.prodId,local_name:origen,stk:-it.cantidad}]);
        // Leer stock destino
        const{data:sD}=await sb.from("gp_stock").select("*").eq("product_id",it.prodId).eq("local_name",destino).single();
        const stkD=sD?Number(sD.stk)||0:0;
        const nuevoD=stkD+it.cantidad;
        if(sD) await sb.from("gp_stock").update({stk:nuevoD}).eq("id",sD.id);
        else await sb.from("gp_stock").insert([{product_id:it.prodId,local_name:destino,stk:it.cantidad}]);
        // Registrar movimientos
        await sb.from("gp_stock_mov").insert([
          {id:Date.now()+it.prodId,product_id:it.prodId,local_name:origen,tipo:"traslado",cantidad:-it.cantidad,stock_antes:stkO,stock_despues:nuevoO,usuario,fecha:now},
          {id:Date.now()+it.prodId+1,product_id:it.prodId,local_name:destino,tipo:"traslado",cantidad:it.cantidad,stock_antes:stkD,stock_despues:nuevoD,usuario,fecha:now},
        ]);
      }
      notify(`✓ Remito #${remitoId} — ${items.length} producto${items.length>1?"s":""} trasladados de ${origen} → ${destino}`);
      // Imprimir remito
      imprimirRemito(remitoId,origen,destino,now,items);
      setItems([]);setProdId("");setCantidad("");
      loadHist();loadAll();
    }catch(e){notify("Error: "+e.message,"err");}
    setSaving(false);
  };

  return(
    <div className="fade">
      <div style={{marginBottom:16}}>
        <h1 style={{fontSize:18,fontWeight:800,margin:0}}>Traslados de Stock</h1>
        <p style={{color:"#ffffff",fontSize:9,margin:"3px 0 0",letterSpacing:2.5}}>MOVIMIENTO INTERNO ENTRE LOCALES · NO AFECTA VENTAS</p>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
        {/* Panel izquierdo — armar orden */}
        <Card sx={{padding:18}}>
          <div style={{fontSize:12,fontWeight:800,color:"#ffffff",marginBottom:14}}>📦 Nueva Orden de Traslado</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
            <div><Lbl t="Origen"/><Sel value={origen} onChange={(e)=>setOrigen(e.target.value)}>{localeNames.map(l=><option key={l}>{l}</option>)}</Sel></div>
            <div><Lbl t="Destino"/><Sel value={destino} onChange={(e)=>setDestino(e.target.value)}><option value="">— Seleccioná —</option>{localeNames.filter(l=>l!==origen).map(l=><option key={l}>{l}</option>)}</Sel></div>
          </div>
          <div style={{background:"#060f1a",border:"1px solid #192a38",borderRadius:8,padding:12,marginBottom:12}}>
            <div style={{fontSize:11,fontWeight:700,color:"#00d4ff",marginBottom:8}}>Agregar producto a la orden:</div>
            <div style={{position:"relative",marginBottom:8}}><Inp placeholder="Buscar producto..." value={q} onChange={(e)=>setQ(e.target.value)} sx={{paddingLeft:28}}/><span style={{position:"absolute",left:8,top:"50%",transform:"translateY(-50%)",opacity:.5}}><Ic n="srch" s={12}/></span></div>
            <Sel value={prodId} onChange={(e)=>setProdId(e.target.value)} sx={{marginBottom:8}}>
              <option value="">— Seleccioná producto —</option>
              {filtProds.map(p=><option key={p.id} value={p.id}>{p.name}{p.code?` #${p.code}`:""}</option>)}
            </Sel>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <Inp type="number" min="0.5" step="0.5" placeholder="Cantidad..." value={cantidad} onChange={(e)=>setCantidad(e.target.value)} sx={{flex:1}} onKeyDown={(e)=>e.key==="Enter"&&agregarItem()}/>
              <span style={{fontSize:11,color:"#ffffff",flexShrink:0}}>{prods.find(p=>p.id===parseInt(prodId))?.unit==="kg"?"kg":"u"}</span>
              <Btn v="cy" sx={{padding:"6px 14px",fontSize:10,flexShrink:0}} onClick={agregarItem}>+ Agregar</Btn>
            </div>
          </div>

          {/* Lista de items agregados */}
          {items.length>0&&<>
            <div style={{fontSize:10,fontWeight:700,color:"#ffffff",marginBottom:6,letterSpacing:1}}>PRODUCTOS EN ESTA ORDEN ({items.length}):</div>
            <div style={{maxHeight:200,overflowY:"auto",marginBottom:12}}>
              {items.map((it,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 10px",background:"#060f1a",border:"1px solid #192a38",borderRadius:6,marginBottom:5}}>
                  <div>
                    <div style={{fontSize:12,fontWeight:700,color:"#ffffff"}}>{it.nombre}{it.code&&<span style={{fontSize:9,color:"#00d4ff",marginLeft:6}}>#{it.code}</span>}</div>
                    <div style={{fontSize:9,color:"#ffffff"}}>{it.cat}</div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontWeight:900,color:"#00cc55",fontSize:14}}>{it.unit==="kg"?fmtW(it.cantidad):`${it.cantidad} u`}</span>
                    <button onClick={()=>quitarItem(it.prodId)} style={{background:"none",border:"none",color:"#ff4444",cursor:"pointer",fontSize:18,padding:0,lineHeight:1}}>×</button>
                  </div>
                </div>
              ))}
            </div>
            {destino&&<div style={{background:"#021408",border:"1px solid #00882233",borderRadius:7,padding:"10px 12px",marginBottom:12,fontSize:11}}>
              <div style={{color:"#00cc55",fontWeight:700,marginBottom:2}}>📋 Resumen:</div>
              <div style={{color:"#ffffff"}}>{items.length} producto{items.length>1?"s":""} · {origen} → {destino}</div>
            </div>}
            <Btn v="g" sx={{width:"100%",justifyContent:"center",fontSize:12}} onClick={confirmarTraslado} disabled={saving||!destino}>
              {saving?<><Ic n="spin" s={14}/>Procesando...</>:<><Ic n="prt" s={14}/>Confirmar y Generar Remito</>}
            </Btn>
          </>}
          {items.length===0&&<div style={{textAlign:"center",padding:"20px 0",color:"#ffffff",fontSize:11}}>Agregá productos para armar la orden</div>}
        </Card>

        {/* Panel derecho — instrucciones */}
        <Card sx={{padding:18}}>
          <div style={{fontSize:12,fontWeight:700,color:"#ffffff",marginBottom:12}}>ℹ️ ¿Cómo funciona?</div>
          <div style={{fontSize:12,color:"#ffffff",lineHeight:1.8}}>
            <div style={{marginBottom:8}}>📥 <strong>1.</strong> Seleccioná origen y destino</div>
            <div style={{marginBottom:8}}>📦 <strong>2.</strong> Agregá todos los productos que van en este traslado</div>
            <div style={{marginBottom:8}}>✅ <strong>3.</strong> Confirmá — el stock se actualiza automáticamente</div>
            <div style={{marginBottom:8}}>🖨️ <strong>4.</strong> Se imprime el remito con número único</div>
            <div style={{marginBottom:8}}>📋 <strong>5.</strong> El remito queda guardado — podés reimprimir cuando quieras</div>
          </div>
          <div style={{padding:"10px 14px",background:"#130900",border:"1px solid #ff990033",borderRadius:8,color:"#ff9900",fontSize:11,marginTop:8}}>
            ⚠ Los traslados no afectan los reportes de ventas ni el cálculo de rentabilidad
          </div>
        </Card>
      </div>

      {/* Historial de remitos */}
      <Card sx={{overflow:"hidden"}}>
        <div style={{padding:"11px 16px",borderBottom:"1px solid #192a38"}}>
          <span style={{fontSize:8,fontWeight:700,letterSpacing:2.5,color:"#ffffff",textTransform:"uppercase"}}>Historial de Remitos</span>
        </div>
        {loadingHist&&<div style={{padding:20,textAlign:"center",color:"#ffffff"}}>Cargando...</div>}
        {!loadingHist&&remitos.length===0&&<div style={{padding:20,textAlign:"center",color:"#ffffff",fontSize:12}}>Sin traslados registrados</div>}
        {!loadingHist&&remitos.length>0&&<table>
          <thead><tr><th>Nº Remito</th><th>Fecha</th><th>Origen</th><th>Destino</th><th>Productos</th><th>Responsable</th><th></th></tr></thead>
          <tbody>{remitos.map((r)=>{
            const nombreResp=r.usuario?.split("·")[0]?.trim()||"—";
            return(<tr key={r.id} style={{cursor:"pointer"}} onClick={()=>setDetRemito(r)}>
              <td style={{fontWeight:800,color:"#00d4ff",fontFamily:"monospace"}}>#{r.id}</td>
              <td style={{fontSize:11}}>{new Date(r.fecha).toLocaleString("es-AR",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit",hour12:false})}</td>
              <td style={{color:"#ff9900",fontWeight:700}}>{r.origen||"—"}</td>
              <td style={{color:"#00cc55",fontWeight:700}}>{r.destino||"—"}</td>
              <td style={{color:"#ffffff"}}>{r.items.length} producto{r.items.length!==1?"s":""}</td>
              <td style={{color:"#ffffff",fontSize:11}}>{nombreResp}</td>
              <td><div style={{display:"flex",gap:4}}>
                <Btn v="gh" sx={{padding:"3px 8px",fontSize:9}} onClick={(e)=>{e.stopPropagation();setDetRemito(r);}}><Ic n="eye" s={11}/>Ver</Btn>
                <Btn v="cy" sx={{padding:"3px 8px",fontSize:9}} onClick={(e)=>{e.stopPropagation();imprimirRemito(r.id,r.origen,r.destino,r.fecha,r.items.map(m=>({prodId:m.product_id,cantidad:Math.abs(m.cantidad)})));}}><Ic n="prt" s={11}/>PDF</Btn>
              </div></td>
            </tr>);
          })}</tbody>
        </table>}
      </Card>

      {/* Modal detalle remito */}
      {detRemito&&<Modal close={()=>setDetRemito(null)} w={620}><div style={{padding:22}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div>
            <h2 style={{margin:0,fontSize:16,fontWeight:800}}>Remito #{detRemito.id}</h2>
            <div style={{fontSize:10,color:"#ffffff",marginTop:3}}>{new Date(detRemito.fecha).toLocaleString("es-AR",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit",hour12:false})} · {detRemito.origen} → {detRemito.destino}</div>
          </div>
          <div style={{display:"flex",gap:8}}>
            <Btn v="cy" sx={{padding:"5px 12px",fontSize:10}} onClick={()=>imprimirRemito(detRemito.id,detRemito.origen,detRemito.destino,detRemito.fecha,detRemito.items.map(m=>({prodId:m.product_id,cantidad:Math.abs(m.cantidad)})))}><Ic n="prt" s={12}/>Reimprimir</Btn>
            <Btn v="gh" sx={{padding:"3px 8px"}} onClick={()=>setDetRemito(null)}><Ic n="x" s={13}/></Btn>
          </div>
        </div>
        <div style={{display:"flex",gap:12,marginBottom:14}}>
          <div style={{background:"#140800",border:"1px solid #ff990033",borderRadius:8,padding:"10px 14px",flex:1,textAlign:"center"}}><div style={{fontSize:9,color:"#ffffff",marginBottom:3}}>ORIGEN</div><div style={{fontSize:15,fontWeight:800,color:"#ff9900"}}>📦 {detRemito.origen}</div></div>
          <div style={{background:"#021408",border:"1px solid #00882233",borderRadius:8,padding:"10px 14px",flex:1,textAlign:"center"}}><div style={{fontSize:9,color:"#ffffff",marginBottom:3}}>DESTINO</div><div style={{fontSize:15,fontWeight:800,color:"#00cc55"}}>📍 {detRemito.destino}</div></div>
        </div>
        <Card sx={{overflow:"hidden"}}>
          <table><thead><tr><th>Producto</th><th>Cantidad trasladada</th><th>Stock antes</th><th>Stock después</th></tr></thead>
            <tbody>{detRemito.items.map((m,i)=>{
              const prod=prods.find(p=>p.id===m.product_id);
              return(<tr key={i}>
                <td style={{fontWeight:700,color:"#ffffff"}}>{prod?.name||`#${m.product_id}`}{prod?.code&&<span style={{fontSize:9,color:"#00d4ff",marginLeft:6}}>#{prod.code}</span>}</td>
                <td style={{color:"#00cc55",fontWeight:800,fontSize:13}}>{prod?.unit==="kg"?fmtW(Math.abs(m.cantidad)):`${Math.abs(m.cantidad)} u`}</td>
                <td style={{color:"#ffffff",fontSize:11}}>{prod?.unit==="kg"?fmtW(m.stock_antes):`${m.stock_antes} u`}</td>
                <td style={{color:"#00cc55",fontSize:11}}>{prod?.unit==="kg"?fmtW(m.stock_despues):`${m.stock_despues} u`}</td>
              </tr>);
            })}</tbody>
          </table>
        </Card>
      </div></Modal>}
    </div>
  );
}
