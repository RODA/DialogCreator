
mkdir DialogCreator.iconset
sips -z 16 16   DialogCreator.png --out DialogCreator.iconset/icon_16x16.png
sips -z 32 32   DialogCreator.png --out DialogCreator.iconset/icon_16x16@2x.png
sips -z 32 32   DialogCreator.png --out DialogCreator.iconset/icon_32x32.png
sips -z 64 64   DialogCreator.png --out DialogCreator.iconset/icon_32x32@2x.png
sips -z 128 128 DialogCreator.png --out DialogCreator.iconset/icon_128x128.png
sips -z 256 256 DialogCreator.png --out DialogCreator.iconset/icon_128x128@2x.png
sips -z 256 256 DialogCreator.png --out DialogCreator.iconset/icon_256x256.png
sips -z 512 512 DialogCreator.png --out DialogCreator.iconset/icon_256x256@2x.png
sips -z 512 512 DialogCreator.png --out DialogCreator.iconset/icon_512x512.png
cp DialogCreator.png DialogCreator.iconset/icon_512x512@2x.png

iconutil -c icns DialogCreator.iconset

magick DialogCreator.png -define icon:auto-resize=256,128,64,48,32,16 DialogCreator.ico