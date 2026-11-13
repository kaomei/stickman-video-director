"""New authored 7.5s timeline over reusable painted performances; no video inputs."""
def frame(t, context):
    if t < 146/30:
        return context.engine.draw(min(9+1/30+t,13+20/30))
    if t < 186/30:
        u=(t-146/30)/(40/30)
        return context.engine.draw(16+17/30+t-146/30,camera=(832+34*u,619,2.08))
    return context.engine.draw(min(18+22/30+t-186/30,19+29/30))
