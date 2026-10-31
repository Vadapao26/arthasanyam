using System;
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
                    Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), @"Microsoft\Edge\Application\msedge.exe"),
                    Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), @"Microsoft\Edge\Application\msedge.exe"),
                    Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), @"Google\Chrome\Application\chrome.exe"),
                    Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), @"Google\Chrome\Application\chrome.exe")
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
                            "--app=\"{0}\" --user-data-dir=\"{1}\" --window-size=1080,820 --disable-background-networking -- disable-sync",
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
                    "Failed to launch Arthasanyam Vault:\n" + ex.Message,
                    "अर्थसंयम (Arthasanyam)",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Error
                );
            }
        }
    }
}
