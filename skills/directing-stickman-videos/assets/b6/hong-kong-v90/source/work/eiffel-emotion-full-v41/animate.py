def gait_solution(phase,k,stride,direction):
 # Signed distance phases let both leftward and rightward actors plant feet.
 u=(phase/(2*math.pi)*direction+k*.5)%1
 if u<STANCE:
  v=u/STANCE;sw=direction*stride*(1-2*v);lift=0.
  angle=(-10*(1-float(m.ease(0,.17,v)))+13*float(m.ease(.78,1,v)))*direction
  pivot=(-22 if v<.5 else 47)*direction
  contact='heel' if v<.17 else ('toe' if v>.78 else 'flat')
 else:
  v=(u-STANCE)/(1-STANCE)
  # Match planted foot velocity at liftoff and landing, not just position.
  tangent=-2*stride*(1-STANCE)/STANCE
  sw=direction*(-stride+2*stride*(3*v*v-2*v*v*v)+tangent*(2*v*v*v-3*v*v+v))
  lift=18*math.sin(math.pi*v)**1.25
  angle=(13*(1-float(m.ease(0,.22,v)))-10*float(m.ease(.08,.62,v)))*direction
  pivot=(47*(1-v)-22*v)*direction;contact='swing'
 sep=(-6 if k==0 else 6)
 foot=T(sw+sep,-lift)@T(pivot,0)@R(angle)@T(-pivot,0)
 ankle=pt(foot,(0,-16))
 return {'u':u,'foot':foot,'ankle':ankle,'contact':contact,'angle':angle,'lift':lift}
