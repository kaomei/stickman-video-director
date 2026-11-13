def line(c,start,end,base,width=1,curve=0):
 # A SINGLE sampled ink stroke. The old rectangular sample contained a second
 # diverging stroke, which produced a rigid triangular double-line on every bone.
 a=asset('ink-stroke');h,w=a.shape[:2]
 start=np.asarray(start,float);end=np.asarray(end,float);v=end-start
 length=np.linalg.norm(v)
 if length<.01:return
 normal=np.array([-v[1],v[0]])/length
 n=5 if abs(curve)>.5 else 1
 for j in range(n):
  u0=j/n;u1=(j+1)/n
  point=lambda u:start+v*u+normal*4*u*(1-u)*curve
  p,q=point(u0),point(u1);dv=q-p;ang=math.degrees(math.atan2(dv[1],dv[0]))
  y0=max(0,int(u0*(h-1))-1);y1=min(h,int(u1*(h-1))+2)
  seg=a[y0:y1];seglen=np.linalg.norm(dv)+1.0
  m=base@T(*p)@R(ang-90)@S(width,seglen/max(1,y1-y0-1))@T(-(w-1)/2,-.5)
  blit(c,seg,m)
