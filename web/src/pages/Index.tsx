
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Hash, Upload, Shield, FileText, Palette } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const tools = [
    {
      id: "file-transfer",
      title: "文件中转",
      description: "快速分享文件，生成临时下载链接",
      icon: Send,
      path: "/file-transfer",
      color: "bg-blue-500"
    },
    {
      id: "md5-hash",
      title: "MD5加密",
      description: "文本MD5哈希值计算工具",
      icon: Hash,
      path: "/md5-hash",
      color: "bg-green-500"
    },
    {
      id: "file-hash",
      title: "文件哈希",
      description: "计算文件的MD5、SHA1等哈希值",
      icon: Shield,
      path: "/file-hash", 
      color: "bg-purple-500"
    },
    {
      id: "base64",
      title: "Base64编码",
      description: "Base64编码解码工具",
      icon: Upload,
      path: "/base64",
      color: "bg-orange-500"
    },
    {
      id: "json-formatter",
      title: "JSON格式化",
      description: "JSON数据美化、压缩和验证工具",
      icon: FileText,
      path: "/json-formatter",
      color: "bg-indigo-500"
    },
    {
      id: "color-preview",
      title: "颜色预览",
      description: "RGB、HEX、HSL颜色预览转换工具",
      icon: Palette,
      path: "/color-preview",
      color: "bg-pink-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                极简工具箱
              </h1>
              <p className="text-gray-600 mt-1">简洁高效的在线工具集合</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">选择您需要的工具</h2>
            <p className="text-gray-600">无需注册，即开即用</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {tools.map((tool) => {
              const IconComponent = tool.icon;
              return (
                <Link key={tool.id} to={tool.path}>
                  <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                    <CardHeader className="text-center">
                      <div className={`w-16 h-16 ${tool.color} rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                        <IconComponent className="w-8 h-8 text-white" />
                      </div>
                      <CardTitle className="text-lg">{tool.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      <CardDescription className="text-sm">
                        {tool.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          {/* Features Section */}
          <div className="mt-20 text-center">
            <h3 className="text-xl font-semibold text-gray-800 mb-8">为什么选择我们？</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-semibold mb-2">安全可靠</h4>
                <p className="text-gray-600 text-sm">所有处理均在本地完成，保护您的隐私</p>
              </div>
              <div className="p-6">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="font-semibold mb-2">即开即用</h4>
                <p className="text-gray-600 text-sm">无需注册登录，打开即可使用</p>
              </div>
              <div className="p-6">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Hash className="w-6 h-6 text-purple-600" />
                </div>
                <h4 className="font-semibold mb-2">功能丰富</h4>
                <p className="text-gray-600 text-sm">持续更新，满足各种使用需求</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 极简工具箱. 简洁高效的在线工具集合</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
