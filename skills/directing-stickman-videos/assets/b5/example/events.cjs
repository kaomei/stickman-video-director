// Shared frame-addressed contact anchors for picture and Foley (30 fps).
const at=t=>Math.round(t*30)/30;
module.exports={
 paperLands:[6.24,6.56,6.96,7.25,7.52].map(at),
 paperRelease:at(7.73), escape:at(7.88),
 contradiction:at(10.9), bodyRebound:at(11.2), revelation:at(12.66),
 mirrorTouch:at(19.14), mirrorRetouch:at(20.3), self:at(21.26), you:at(21.48)
};
