require 'json'

package = JSON.parse(File.read(File.join(__dir__, '..', '..', '..', 'package.json')))

Pod::Spec.new do |s|
  s.name           = 'MlaiCloudKit'
  s.version        = package['version'] || '1.0.0'
  s.summary        = 'CloudKit private-database bridge for MLAI mobile.'
  s.description    = 'Saves, queries, and deletes records in the user private CloudKit database.'
  s.author         = 'MLAI'
  s.homepage       = 'https://mlai.dev'
  s.platforms      = { :ios => '15.1' }
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'SWIFT_COMPILATION_MODE' => 'wholemodule'
  }

  s.source_files = '**/*.{h,m,mm,swift,hpp,cpp}'
end
