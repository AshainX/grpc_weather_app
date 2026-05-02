import { FiGithub, FiTwitter, FiLinkedin } from "react-icons/fi";

export default function Footer() {
  return (
    <footer className="footer bg-white dark:bg-gray-800">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-gray-600 dark:text-gray-400">
            &copy; {new Date().getFullYear()} GRPC Professional Dashboard. All rights reserved.
          </div>
          <div className="flex gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 dark:text-gray-400 hover:text-primary-600"
              aria-label="GitHub"
            >
              <FiGithub size={20} />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 dark:text-gray-400 hover:text-primary-600"
              aria-label="Twitter"
            >
              <FiTwitter size={20} />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 dark:text-gray-400 hover:text-primary-600"
              aria-label="LinkedIn"
            >
              <FiLinkedin size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}