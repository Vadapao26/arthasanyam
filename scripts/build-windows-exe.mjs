import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const rootDir = process.cwd();
const winDir = path.join(rootDir, 'windows');
if (!fs.existsSync(winDir)) {
  fs.mkdirSync(winDir, { recursive: true });
}

/**
 * 1. Generate a 64x64 32-bit BMP-based Windows .ICO file with the Geru & Tandul Warli #16 Emblem
 */
function generateWarliIconIco(outPath) {
  const width = 64;
  const height = 64;
  const pixelBytes = width * height * 4;
  const maskRowBytes = Math.ceil(width / 32) * 4;
  const maskBytes = maskRowBytes * height;
  const bmpHeaderSize = 40;
  const imageSize = bmpHeaderSize + pixelBytes + maskBytes;

  const buf = Buffer.alloc(6 + 16 + imageSize, 0);

  // ICONDIR header
  buf.writeUInt16LE(0, 0); // Reserved
  buf.writeUInt16LE(1, 2); // Type: 1 = ICO
  buf.writeUInt16LE(1, 4); // Count: 1 image

  // ICONDIRENTRY
  buf.writeUInt8(width, 6);
  buf.writeUInt8(height, 7);
  buf.writeUInt8(0, 8); // Palette
  buf.writeUInt8(0, 9); // Reserved
  buf.writeUInt16LE(1, 10); // Color planes
  buf.writeUInt16LE(32, 12); // Bits per pixel
  buf.writeUInt32LE(imageSize, 14);
  buf.writeUInt32LE(22, 18); // Offset to BMP data

  // BITMAPINFOHEADER
  const bmpOffset = 22;
  buf.writeUInt32LE(bmpHeaderSize, bmpOffset);
  buf.writeInt32LE(width, bmpOffset + 4);
  buf.writeInt32LE(height * 2, bmpOffset + 8); // XOR + AND height
  buf.writeUInt16LE(1, bmpOffset + 12);
  buf.writeUInt16LE(32, bmpOffset + 14);
  buf.writeUInt32LE(0, bmpOffset + 16);
  buf.writeUInt32LE(pixelBytes + maskBytes, bmpOffset + 20);

  const pixOffset = bmpOffset + bmpHeaderSize;

  function setPixel(x, y, r, g, b, a = 255) {
    if (x < 0 || x >= width || y < 0 || y >= height) return;
    // ICO BMP rows are bottom-up
    const row = height - 1 - y;
    const idx = pixOffset + (row * width + x) * 4;
    buf[idx] = b;
    buf[idx + 1] = g;
    buf[idx + 2] = r;
    buf[idx + 3] = a;
  }

  // Draw rounded Geru (#9E3B24) square with Tandul (#FBF8F5) Warli Chowk & #16 triangles
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // Rounded corners
      const dx = Math.min(x, width - 1 - x);
      const dy = Math.min(y, height - 1 - y);
      if (dx < 6 && dy < 6 && (6 - dx) * (6 - dx) + (6 - dy) * (6 - dy) > 36) {
        setPixel(x, y, 0, 0, 0, 0);
        continue;
      }

      // Base Geru (#9E3B24 -> R:158, G:59, B:36)
      let isTandul = false;

      // Outer Chowk border
      if ((x === 5 || x === 58) && y >= 5 && y <= 58 && (x + y) % 3 !== 0) isTandul = true;
      if ((y === 5 || y === 58) && x >= 5 && x <= 58 && (x + y) % 3 !== 0) isTandul = true;

      // Inner Chowk frame
      if ((x === 9 || x === 54) && y >= 9 && y <= 54) isTandul = true;
      if ((y === 9 || y === 54) && x >= 9 && x <= 54) isTandul = true;

      // Center Warli Opposing Triangles (Hourglass / Damaru / Gavali motif)
      const cx = x - 31.5;
      const cy = y - 31.5;
      if (Math.abs(cy) <= 14 && Math.abs(cx) <= Math.abs(cy) * 0.85) {
        isTandul = true;
      }
      // Sun & Moon dots
      if ((x - 31.5) ** 2 + (y - 14) ** 2 <= 7) isTandul = true;
      if ((x - 31.5) ** 2 + (y - 49) ** 2 <= 7) isTandul = true;

      if (isTandul) {
        setPixel(x, y, 251, 248, 245, 255); // #FBF8F5
      } else {
        setPixel(x, y, 158, 59, 36, 255); // #9E3B24
      }
    }
  }

  fs.writeFileSync(outPath, buf);
}

const icoPath = path.join(winDir, 'warli.ico');
generateWarliIconIco(icoPath);
console.log('✓ Generated Warli Windows icon:', icoPath);

/**
 * 2. Write the C# Native Desktop Launcher source (windows/ArthasanyamApp.cs)
 */
const csSource = `using System;
using System.Diagnostics;
using System.IO;
using System.Reflection;
using System.Windows.Forms;

[assembly: AssemblyTitle("Arthasanyam (अर्थसंयम) — Offline Jamakharch Vault")]
[assembly: AssemblyDescription("100% Offline-First Maharashtrian Jamakharch Ledger & Personal Finance App")]
[assembly: AssemblyCompany("Arthasanyam Offline Vault")]
[assembly: AssemblyProduct("अर्थसंयम (Arthasanyam)")]
[assembly: AssemblyVersion("1.2.0.0")]
[assembly: AssemblyFileVersion("1.2.0.0")]

namespace ArthasanyamDesktop
{
    static class Program
    {
        [STAThread]
        static void Main()
        {
            try
            {
                string appDataDir = Path.Combine(
                    Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
                    "Arthasanyam"
                );
                string userDataDir = Path.Combine(appDataDir, "VaultProfile");
                Directory.CreateDirectory(appDataDir);
                Directory.CreateDirectory(userDataDir);

                string htmlPath = Path.Combine(appDataDir, "arthasanyam-vault-v1.2.html");

                // Extract embedded single-file offline HTML bundle
                Assembly asm = Assembly.GetExecutingAssembly();
                using (Stream resStream = asm.GetManifestResourceStream("arthasanyam-portable-offline.html"))
                {
                    if (resStream != null)
                    {
                        using (FileStream fs = new FileStream(htmlPath, FileMode.Create, FileAccess.Write))
                        {
                            resStream.CopyTo(fs);
                        }
                    }
                }

                string fileUri = new Uri(htmlPath).AbsoluteUri;

                // Locate Microsoft Edge or Google Chrome to launch a native frameless App Window (--app=...)
                string[] browserCandidates = new string[]
                {
                    Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), @"Microsoft\\Edge\\Application\\msedge.exe"),
                    Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), @"Microsoft\\Edge\\Application\\msedge.exe"),
                    Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), @"Google\\Chrome\\Application\\chrome.exe"),
                    Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), @"Google\\Chrome\\Application\\chrome.exe")
                };

                string hostExe = null;
                foreach (string candidate in browserCandidates)
                {
                    if (File.Exists(candidate))
                    {
                        hostExe = candidate;
                        break;
                    }
                }

                if (hostExe != null)
                {
                    ProcessStartInfo psi = new ProcessStartInfo
                    {
                        FileName = hostExe,
                        Arguments = string.Format(
                            "--app=\\"{0}\\" --user-data-dir=\\"{1}\\" --window-size=1080,820 --disable-background-networking -- disable-sync",
                            fileUri,
                            userDataDir
                        ),
                        UseShellExecute = false
                    };
                    Process.Start(psi);
                }
                else
                {
                    Process.Start(new ProcessStartInfo(htmlPath) { UseShellExecute = true });
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show(
                    "Failed to launch Arthasanyam Vault:\\n" + ex.Message,
                    "अर्थसंयम (Arthasanyam)",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Error
                );
            }
        }
    }
}
`;

const csPath = path.join(winDir, 'ArthasanyamApp.cs');
fs.writeFileSync(csPath, csSource, 'utf8');

/**
 * 3. Compile Arthasanyam.exe using Windows built-in .NET C# compiler (csc.exe)
 */
const cscPath = 'C:\\Windows\\Microsoft.NET\\Framework64\\v4.0.30319\\csc.exe';
const htmlBundlePath = path.join(rootDir, 'arthasanyam-portable-offline.html');
const outExeRoot = path.join(rootDir, 'Arthasanyam.exe');

if (fs.existsSync(cscPath) && fs.existsSync(htmlBundlePath)) {
  execFileSync(
    cscPath,
    [
      '/nologo',
      '/target:winexe',
      '/optimize+',
      `/out:${outExeRoot}`,
      `/win32icon:${icoPath}`,
      `/resource:${htmlBundlePath},arthasanyam-portable-offline.html`,
      '/reference:System.dll',
      '/reference:System.Windows.Forms.dll',
      csPath,
    ],
    { stdio: 'inherit' }
  );
  console.log('✓ Compiled standalone Windows Desktop App:', outExeRoot);
} else {
  console.warn('Skipping csc.exe build (compiler or HTML bundle not found).');
}
