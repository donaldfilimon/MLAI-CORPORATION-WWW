import Link from 'next/link';
import { Brand } from './SiteNav';

export function SiteFooter() {
  return (
    <footer>
      <div className="wrap">
        <div className="foot-grid">
          <div>
            <Brand />
            <p className="tag">Privacy-first AI infrastructure for Apple Silicon. AI that never phones home.</p>
            <p className="tag" style={{ color: 'var(--faint)', fontSize: '12.5px', marginTop: 10 }}>
              Zig 0.17-dev · Metal · Accelerate · Core ML
            </p>
          </div>
          <div>
            <div className="col-title">Stack</div>
            <ul>
              <li><Link href="/wdbx">WDBX</Link></li>
              <li><Link href="/abi">ABI Framework</Link></li>
              <li><Link href="/abbey">Abbey</Link></li>
              <li><Link href="/platform">Platform</Link></li>
              <li><Link href="/architecture">Architecture</Link></li>
              <li><Link href="/docs">Docs</Link></li>
            </ul>
          </div>
          <div>
            <div className="col-title">Company</div>
            <ul>
              <li><Link href="/services">Services</Link></li>
              <li><Link href="/research">Research</Link></li>
              <li><Link href="/company">Company</Link></li>
              <li><Link href="/investors">Investors</Link></li>
              <li><Link href="/contact">Contact</Link></li>
            </ul>
          </div>
          <div>
            <div className="col-title">Provenance</div>
            <p className="legend">
              <b>measured</b> — wdbx bench, single M-series node<br />
              <b>target / objective</b> — design goal, not yet measured<br />
              <b>reported</b> — research brief; measured wins on conflict
            </p>
          </div>
        </div>
        <div className="foot-bottom">
          <span>© 2026 Machine Learning Advanced Innovations, Inc.</span>
          <span>Disciplined Secrecy · Mission Stewardship · Operational Velocity</span>
        </div>
      </div>
    </footer>
  );
}
