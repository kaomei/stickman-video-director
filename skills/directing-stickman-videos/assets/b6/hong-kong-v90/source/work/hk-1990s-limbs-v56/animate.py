def bag():
 a=asset('grocery-bag').copy();h,w=a.shape[:2];rgb=a[:,:,:3]/np.maximum(a[:,:,3:4],1e-4)
 yy,xx=np.mgrid[:h,:w];mask=np.uint8(((xx-21)**2+(yy-17)**2)<15**2)*255
 rgb=cv2.inpaint(np.uint8(np.clip(rgb*255,0,255)),mask,5,cv2.INPAINT_TELEA).astype(np.float32)/255
 poly=np.int32([(21,17),(84,1),(93,31),(90,37),(109,111),(25,121),(1,119),(4,69),(9,31)])
 mask=np.zeros((h*4,w*4),np.uint8);cv2.fillPoly(mask,[poly*4],255,cv2.LINE_AA)
 alpha=cv2.resize(mask,(w,h),interpolation=cv2.INTER_AREA).astype(np.float32)/255
 for seg in [[(9,32),(21,17),(37,13)],[(21,17),(16,35)]]:cv2.polylines(rgb,[np.int32(seg)],False,(.31,.19,.22),3,cv2.LINE_AA)
 a[:,:,:3]=rgb*alpha[:,:,None];a[:,:,3]=alpha;return a
