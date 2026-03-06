marginBottom:18}}><div style={{width:52,height:52,borderRadius:"50%",background:"#110310",border:"2px solid #cc44ff44",display:"flex",alignItems:"center",justifyContent:"center"}}><Ic n="shld" s={22} c="#cc44ff"/></div><div><div style={{fontSize:16,fontWeight:800,color:"#bdd0e0"}}>{session.name}</div><div style={{fontSize:10,color:"#2a3d50"}}>@{session.username} · Admin</div></div></div>
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
