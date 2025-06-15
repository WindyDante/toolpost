
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Palette, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";

const ColorPreview = () => {
  const [rgbR, setRgbR] = useState(255);
  const [rgbG, setRgbG] = useState(0);
  const [rgbB, setRgbB] = useState(0);
  const [hexColor, setHexColor] = useState("#FF0000");
  const [hslH, setHslH] = useState(0);
  const [hslS, setHslS] = useState(100);
  const [hslL, setHslL] = useState(50);
  const { toast } = useToast();

  // RGB to HEX conversion
  const rgbToHex = (r: number, g: number, b: number) => {
    const toHex = (n: number) => {
      const hex = Math.max(0, Math.min(255, Math.round(n))).toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
  };

  // HEX to RGB conversion
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  // RGB to HSL conversion
  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  };

  // HSL to RGB conversion
  const hslToRgb = (h: number, s: number, l: number) => {
    h /= 360;
    s /= 100;
    l /= 100;

    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  };

  // Update other formats when RGB changes
  useEffect(() => {
    const hex = rgbToHex(rgbR, rgbG, rgbB);
    const hsl = rgbToHsl(rgbR, rgbG, rgbB);
    setHexColor(hex);
    setHslH(hsl.h);
    setHslS(hsl.s);
    setHslL(hsl.l);
  }, [rgbR, rgbG, rgbB]);

  // Update RGB and HSL when HEX changes
  const handleHexChange = (hex: string) => {
    setHexColor(hex);
    const rgb = hexToRgb(hex);
    if (rgb) {
      setRgbR(rgb.r);
      setRgbG(rgb.g);
      setRgbB(rgb.b);
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
      setHslH(hsl.h);
      setHslS(hsl.s);
      setHslL(hsl.l);
    }
  };

  // Update RGB and HEX when HSL changes
  const handleHslChange = (h: number, s: number, l: number) => {
    setHslH(h);
    setHslS(s);
    setHslL(l);
    const rgb = hslToRgb(h, s, l);
    setRgbR(rgb.r);
    setRgbG(rgb.g);
    setRgbB(rgb.b);
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    setHexColor(hex);
  };

  const copyToClipboard = (text: string, format: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "复制成功",
      description: `${format}值已复制到剪贴板`,
    });
  };

  const currentColor = `rgb(${rgbR}, ${rgbG}, ${rgbB})`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-pink-50">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-pink-500 rounded-xl flex items-center justify-center">
                <Palette className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                颜色预览工具
              </h1>
            </div>
            <p className="text-gray-600">RGB、HEX、HSL颜色预览和转换</p>
          </div>

          {/* Color Preview */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>颜色预览</CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                className="w-full h-32 rounded-lg border-2 border-gray-200 shadow-inner"
                style={{ backgroundColor: currentColor }}
              />
              <div className="mt-4 text-center">
                <p className="text-lg font-mono font-semibold">{currentColor}</p>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* RGB Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">RGB</CardTitle>
                <CardDescription>红绿蓝色值 (0-255)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="rgb-r">Red (红)</Label>
                  <Input
                    id="rgb-r"
                    type="number"
                    min="0"
                    max="255"
                    value={rgbR}
                    onChange={(e) => setRgbR(Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="rgb-g">Green (绿)</Label>
                  <Input
                    id="rgb-g"
                    type="number"
                    min="0"
                    max="255"
                    value={rgbG}
                    onChange={(e) => setRgbG(Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="rgb-b">Blue (蓝)</Label>
                  <Input
                    id="rgb-b"
                    type="number"
                    min="0"
                    max="255"
                    value={rgbB}
                    onChange={(e) => setRgbB(Number(e.target.value))}
                  />
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => copyToClipboard(`rgb(${rgbR}, ${rgbG}, ${rgbB})`, "RGB")}
                  className="w-full"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  复制RGB
                </Button>
              </CardContent>
            </Card>

            {/* HEX Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="text-blue-600">HEX</CardTitle>
                <CardDescription>十六进制色值</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="hex-color">HEX值</Label>
                  <Input
                    id="hex-color"
                    type="text"
                    value={hexColor}
                    onChange={(e) => handleHexChange(e.target.value)}
                    placeholder="#FF0000"
                  />
                </div>
                <div>
                  <Label htmlFor="color-picker">颜色选择器</Label>
                  <Input
                    id="color-picker"
                    type="color"
                    value={hexColor}
                    onChange={(e) => handleHexChange(e.target.value)}
                    className="h-12"
                  />
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => copyToClipboard(hexColor, "HEX")}
                  className="w-full"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  复制HEX
                </Button>
              </CardContent>
            </Card>

            {/* HSL Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="text-purple-600">HSL</CardTitle>
                <CardDescription>色相、饱和度、亮度</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="hsl-h">Hue (色相) 0-360°</Label>
                  <Input
                    id="hsl-h"
                    type="number"
                    min="0"
                    max="360"
                    value={hslH}
                    onChange={(e) => handleHslChange(Number(e.target.value), hslS, hslL)}
                  />
                </div>
                <div>
                  <Label htmlFor="hsl-s">Saturation (饱和度) 0-100%</Label>
                  <Input
                    id="hsl-s"
                    type="number"
                    min="0"
                    max="100"
                    value={hslS}
                    onChange={(e) => handleHslChange(hslH, Number(e.target.value), hslL)}
                  />
                </div>
                <div>
                  <Label htmlFor="hsl-l">Lightness (亮度) 0-100%</Label>
                  <Input
                    id="hsl-l"
                    type="number"
                    min="0"
                    max="100"
                    value={hslL}
                    onChange={(e) => handleHslChange(hslH, hslS, Number(e.target.value))}
                  />
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => copyToClipboard(`hsl(${hslH}, ${hslS}%, ${hslL}%)`, "HSL")}
                  className="w-full"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  复制HSL
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ColorPreview;
