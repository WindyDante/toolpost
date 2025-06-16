
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Check, AlertCircle, Minimize2, Maximize2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";

const JsonFormatter = () => {
  const [inputJson, setInputJson] = useState("");
  const [outputJson, setOutputJson] = useState("");
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const { toast } = useToast();

  const formatJson = () => {
    try {
      const parsed = JSON.parse(inputJson);
      const formatted = JSON.stringify(parsed, null, 2);
      setOutputJson(formatted);
      setIsValid(true);
      setErrorMessage("");
      toast({
        title: "格式化成功",
        description: "JSON已成功格式化",
      });
    } catch (error) {
      setIsValid(false);
      setErrorMessage(error instanceof Error ? error.message : "JSON格式错误");
      setOutputJson("");
      toast({
        title: "格式化失败",
        description: "JSON格式不正确",
        variant: "destructive",
      });
    }
  };

  const compressJson = () => {
    try {
      const parsed = JSON.parse(inputJson);
      const compressed = JSON.stringify(parsed);
      setOutputJson(compressed);
      setIsValid(true);
      setErrorMessage("");
      toast({
        title: "压缩成功",
        description: "JSON已成功压缩",
      });
    } catch (error) {
      setIsValid(false);
      setErrorMessage(error instanceof Error ? error.message : "JSON格式错误");
      setOutputJson("");
      toast({
        title: "压缩失败",
        description: "JSON格式不正确",
        variant: "destructive",
      });
    }
  };

  const validateJson = () => {
    try {
      JSON.parse(inputJson);
      setIsValid(true);
      setErrorMessage("");
      toast({
        title: "验证成功",
        description: "JSON格式正确",
      });
    } catch (error) {
      setIsValid(false);
      setErrorMessage(error instanceof Error ? error.message : "JSON格式错误");
      toast({
        title: "验证失败",
        description: "JSON格式不正确",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(outputJson);
    toast({
      title: "复制成功",
      description: "已复制到剪贴板",
    });
  };

  const clearAll = () => {
    setInputJson("");
    setOutputJson("");
    setIsValid(null);
    setErrorMessage("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                JSON格式化工具
              </h1>
            </div>
            <p className="text-gray-600">美化、压缩和验证JSON数据</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  输入JSON
                </CardTitle>
                <CardDescription>
                  在此处粘贴或输入您的JSON数据
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="请输入JSON数据..."
                  value={inputJson}
                  onChange={(e) => setInputJson(e.target.value)}
                  className="min-h-[300px] font-mono text-sm"
                />
                
                {isValid !== null && (
                  <div className={`flex items-center gap-2 p-3 rounded-lg ${
                    isValid ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                  }`}>
                    {isValid ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>JSON格式正确</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4" />
                        <span>错误: {errorMessage}</span>
                      </>
                    )}
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  <Button onClick={formatJson} variant="default">
                    <Maximize2 className="w-4 h-4 mr-2" />
                    格式化
                  </Button>
                  <Button onClick={compressJson} variant="outline">
                    <Minimize2 className="w-4 h-4 mr-2" />
                    压缩
                  </Button>
                  <Button onClick={validateJson} variant="outline">
                    <Check className="w-4 h-4 mr-2" />
                    验证
                  </Button>
                  <Button onClick={clearAll} variant="outline">
                    清空
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Output Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  输出结果
                </CardTitle>
                <CardDescription>
                  格式化或压缩后的JSON数据
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="处理后的JSON将显示在这里..."
                  value={outputJson}
                  readOnly
                  className="min-h-[300px] font-mono text-sm bg-gray-50"
                />
                
                {outputJson && (
                  <Button onClick={copyToClipboard} variant="outline" className="w-full">
                    复制结果
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Features */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <Maximize2 className="w-8 h-8 text-indigo-500 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">美化格式</h3>
                <p className="text-sm text-gray-600">将压缩的JSON格式化为易读的结构</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Minimize2 className="w-8 h-8 text-indigo-500 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">压缩数据</h3>
                <p className="text-sm text-gray-600">移除空格和换行，最小化JSON体积</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Check className="w-8 h-8 text-indigo-500 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">格式验证</h3>
                <p className="text-sm text-gray-600">检查JSON语法是否正确并显示错误</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default JsonFormatter;
