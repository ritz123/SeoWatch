import { Card, CardContent } from "@/components/ui/card";
import { Globe, ExternalLink } from "lucide-react";
import type { SeoAnalysisResult } from "@shared/schema";

interface PreviewCardsProps {
  previews: SeoAnalysisResult["previews"];
}

export function PreviewCards({ previews }: PreviewCardsProps) {
  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Google SERP Preview */}
      <Card className="shadow-sm border border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">G</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Google SERP Preview</h3>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="space-y-1">
              <div className="text-xs text-gray-500 flex items-center space-x-1">
                <Globe className="w-3 h-3 text-green-600" />
                <span>{previews.google.url}</span>
              </div>
              <h4 className="text-blue-700 text-lg font-normal hover:underline cursor-pointer">
                {previews.google.title}
              </h4>
              <p className="text-gray-700 text-sm leading-relaxed">
                {previews.google.description}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Facebook Share Preview */}
      <Card className="shadow-sm border border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">f</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Facebook Share Preview</h3>
          </div>
          <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
            <div className="space-y-0">
              {previews.facebook.image ? (
                <div className="w-full h-40 bg-gray-300 flex items-center justify-center">
                  <img 
                    src={previews.facebook.image} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const parent = e.currentTarget.parentElement;
                      if (parent) {
                        parent.className = "w-full h-40 bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center";
                        parent.innerHTML = '<ExternalLink class="text-white text-4xl" />';
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="w-full h-40 bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                  <ExternalLink className="text-white text-4xl" />
                </div>
              )}
              <div className="p-4">
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                  {previews.facebook.domain}
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  {previews.facebook.title}
                </h4>
                <p className="text-gray-600 text-sm">
                  {previews.facebook.description}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Twitter Card Preview */}
      <Card className="shadow-sm border border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-5 h-5 rounded bg-blue-400 flex items-center justify-center">
              <span className="text-white text-xs font-bold">𝕏</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Twitter Card Preview</h3>
          </div>
          <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
            <div className="space-y-0">
              {previews.twitter.image ? (
                <div className="w-full h-48 bg-gray-300 flex items-center justify-center">
                  <img 
                    src={previews.twitter.image} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const parent = e.currentTarget.parentElement;
                      if (parent) {
                        parent.className = "w-full h-48 bg-gradient-to-r from-blue-400 to-blue-500 flex items-center justify-center";
                        parent.innerHTML = '<ExternalLink class="text-white text-5xl" />';
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="w-full h-48 bg-gradient-to-r from-blue-400 to-blue-500 flex items-center justify-center">
                  <ExternalLink className="text-white text-5xl" />
                </div>
              )}
              <div className="p-4">
                <h4 className="font-semibold text-gray-900 mb-1">
                  {previews.twitter.title}
                </h4>
                <p className="text-gray-600 text-sm mb-2">
                  {previews.twitter.description}
                </p>
                <div className="text-xs text-gray-500">
                  {previews.twitter.domain}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* LinkedIn Share Preview */}
      <Card className="shadow-sm border border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-5 h-5 rounded bg-blue-700 flex items-center justify-center">
              <span className="text-white text-xs font-bold">in</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">LinkedIn Share Preview</h3>
          </div>
          <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
            <div className="space-y-0">
              {previews.linkedin.image ? (
                <div className="w-full h-36 bg-gray-300 flex items-center justify-center">
                  <img 
                    src={previews.linkedin.image} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const parent = e.currentTarget.parentElement;
                      if (parent) {
                        parent.className = "w-full h-36 bg-gradient-to-r from-blue-700 to-blue-800 flex items-center justify-center";
                        parent.innerHTML = '<ExternalLink class="text-white text-4xl" />';
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="w-full h-36 bg-gradient-to-r from-blue-700 to-blue-800 flex items-center justify-center">
                  <ExternalLink className="text-white text-4xl" />
                </div>
              )}
              <div className="p-4">
                <h4 className="font-semibold text-gray-900 mb-1">
                  {previews.linkedin.title}
                </h4>
                <p className="text-gray-600 text-sm mb-2">
                  {previews.linkedin.description}
                </p>
                <div className="text-xs text-gray-500">
                  {previews.linkedin.domain}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
