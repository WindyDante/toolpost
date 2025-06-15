
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Download, Copy, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";

const Base64 = () => {
  const [textInput, setTextInput] = useState("");
  const [base64Input, setBase64Input] = useState("");
  const [textResult, setTextResult] = useState("");
  const [base64Result, setBase64Result] = useState("");
  const { toast } = useToast();

  const encodeToBase64 = () => {
    if (!textInput.trim()) {
      toast({
        title: "请输入文本",
        description: "请先输入要编码的文本内容",
        variant: "destructive"
      });
      return;
    }

    try {
      const encoded = btoa(unescape(encodeURIComponent(textInput)));
      setBase64Result(encoded);
      toast({
        title: "编码成功",
        description: "文本已成功编码为Base64",
      });
    } catch (error) {
      toast({
        title: "编码失败",
        description: "文本编码过程中出现错误",
        variant: "destructive"
      });
    }
  };

  const decodeFromBase64 = () => {
    if (!base64Input.trim()) {
      toast({
        title: "请输入Base64",
        description: "请先输入要解码的Base64内容",
        variant: "destructive"
      });
      return;
    }

    try {
      const decoded = decodeURIComponent(escape(atob(base64Input)));
      setTextResult(decoded);
      toast({
        title: "解码成功",
        description: "Base64已成功解码为文本",
      });
    } catch (error) {
      toast({
        title: "解码失败",
        description: "输入的Base64格式不正确",
        variant: "destructive"
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "复制成功",
      description: "内容已复制到剪贴板",
    });
  };

  const clearEncode = () => {
    setTextInput("");
    setBase64Result("");
  };

  const clearDecode = () => {
    setBase64Input("");
    setTextResult("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Base64编码解码</h1>
            <p className="text-gray-600">文本与Base64编码之间的相互转换</p>
          </div>

          <Tabs defaultValue="encode" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="encode" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                编码
              </TabsTrigger>
              <TabsTrigger value="decode" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                解码
              </TabsTrigger>
            </TabsList>

            {/* Encode Tab */}
            <TabsContent value="encode">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle>输入文本</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      placeholder="请输入要编码的文本..."
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      className="min-h-[200px] resize-none"
                    />
                    <div className="flex gap-2">
                      <Button onClick={encodeToBase64} className="flex-1">
                        编码为Base64
                      </Button>
                      <Button variant="outline" onClick={clearEncode}>
                        <RotateCcw className="w-4 h-4 mr-1" />
                        清空
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Base64结果</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4 min-h-[200px] flex items-center justify-center">
                      {base64Result ? (
                        <div className="w-full">
                          <div className="bg-white p-4 rounded border font-mono text-sm break-all max-h-[160px] overflow-y-auto">
                            {base64Result}
                          </div>
                          <Button 
                            onClick={() => copyToClipboard(base64Result)} 
                            className="w-full mt-4"
                            variant="outline"
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            复制结果
                          </Button>
                        </div>
                      ) : (
                        <p className="text-gray-500">Base64编码结果将显示在这里</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Decode Tab */}
            <TabsContent value="decode">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle>输入Base64</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      placeholder="请输入要解码的Base64内容..."
                      value={base64Input}
                      onChange={(e) => setBase64Input(e.target.value)}
                      className="min-h-[200px] resize-none font-mono"
                    />
                    <div className="flex gap-2">
                      <Button onClick={decodeFromBase64} className="flex-1">
                        解码为文本
                      </Button>
                      <Button variant="outline" onClick={clearDecode}>
                        <RotateCcw className="w-4 h-4 mr-1" />
                        清空
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>解码结果</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4 min-h-[200px] flex items-center justify-center">
                      {textResult ? (
                        <div className="w-full">
                          <div className="bg-white p-4 rounded border text-sm break-all max-h-[160px] overflow-y-auto">
                            {textResult}
                          </div>
                          <Button 
                            onClick={() => copyToClipboard(textResult)} 
                            className="w-full mt-4"
                            variant="outline"
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            复制结果
                          </Button>
                        </div>
                      ) : (
                        <p className="text-gray-500">解码结果将显示在这里</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Info Section */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>关于Base64</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">什么是Base64？</h3>
                  <p className="text-gray-600 text-sm">
                    Base64是一种基于64个可打印字符来表示二进制数据的编码方法。
                    常用于在不支持二进制数据的场合传输数据。
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">使用场景</h3>
                  <ul className="text-gray-600 text-sm space-y-1">
                    <li>• 邮件附件编码</li>
                    <li>• 网页中嵌入图片</li>
                    <li>• API数据传输</li>
                    <li>• 配置文件存储</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Base64;
