export function convertS3UrlToLocalPath(url) {
  const s3BaseUrl = 'https://wedding-touch-by-saadgi-storage.s3.eu-west-1.amazonaws.com/';
  const localBasePath = 'https://weddingtouchbysaadgi.blob.core.windows.net/files/';

  if (!url.startsWith(s3BaseUrl)) {
    throw new Error('URL does not match expected S3 base path.');
  }

  const relativePath = url.slice(s3BaseUrl.length);
  const localPath = localBasePath + relativePath.replace(/\//g, '\\'); // For Windows-style paths

  return localPath;
}