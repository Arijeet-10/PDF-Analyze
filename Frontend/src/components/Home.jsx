import React from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/service");
  };
  return (
    <>
      
      <div
        className="relative flex size-full min-h-screen flex-col bg-white group/design-root overflow-x-hidden"
        style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}
      >
        <div className="layout-container flex h-full grow flex-col">
          {/* <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#f0f3f4] px-10 py-3">
            <div className="flex items-center gap-4 text-[#111618]">
              <div className="size-4">
                <svg
                  viewBox="0 0 48 48"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M36.7273 44C33.9891 44 31.6043 39.8386 30.3636 33.69C29.123 39.8386 26.7382 44 24 44C21.2618 44 18.877 39.8386 17.6364 33.69C16.3957 39.8386 14.0109 44 11.2727 44C7.25611 44 4 35.0457 4 24C4 12.9543 7.25611 4 11.2727 4C14.0109 4 16.3957 8.16144 17.6364 14.31C18.877 8.16144 21.2618 4 24 4C26.7382 4 29.123 8.16144 30.3636 14.31C31.6043 8.16144 33.9891 4 36.7273 4C40.7439 4 44 12.9543 44 24C44 35.0457 40.7439 44 36.7273 44Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <h2 className="text-[#111618] text-lg font-bold leading-tight tracking-[-0.015em]">
                PDF Analyzer
              </h2>
            </div>
            <div className="flex flex-1 justify-end gap-8">
              <div className="flex items-center gap-9">
                <a
                  className="text-[#111618] text-sm font-medium leading-normal"
                  href="#"
                >
                  Home
                </a>
                <a
                  className="text-[#111618] text-sm font-medium leading-normal"
                  href="#"
                >
                  Features
                </a>
                <a
                  className="text-[#111618] text-sm font-medium leading-normal"
                  href="#"
                >
                  Pricing
                </a>
                <a
                  className="text-[#111618] text-sm font-medium leading-normal"
                  href="#"
                >
                  Contact
                </a>
              </div>
              <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#19b3e6] text-[#111618] text-sm font-bold leading-normal tracking-[0.015em]">
                <span className="truncate">Sign Up</span>
              </button>
            </div>
          </header> */}
          <div className="px-40 flex flex-1 justify-center py-5">
            <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
              <div className="@container">
                <div className="@[480px]:p-4">
                  <div
                    className="flex min-h-[480px] flex-col gap-6 bg-cover bg-center bg-no-repeat @[480px]:gap-8 @[480px]:rounded-lg items-center justify-center p-4"
                    style={{
                      backgroundImage:
                        'linear-gradient(rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.4) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuBv_9YnoixfnPhfbO-mULt2lO-C2-L0MtPVSNlpuzy6o__0_pAY0reaGPO92iKK15FrKsD4r3U_ylelIOQBp7hyURCz-mHKM3ssCzfghPTCwZcrQl39wuqpdHwqO8umawhrT7VdwFMu_4kM1fZ5BKe8vH-Htw2YtiZhDHju8BKkh5XyG2SlGvtXEQEskRAQSIvwXjBMkVoKK7lPBgeO5k-5nEXZLLiIglmtZAGdDaCVAexz6totf7DL0CGmwkhRDCb5RUH1Gblmtjs")',
                    }}
                  >
                    <div className="flex flex-col gap-2 text-center">
                      <h1 className="text-white text-4xl font-black leading-tight tracking-[-0.033em] @[480px]:text-5xl @[480px]:font-black @[480px]:leading-tight @[480px]:tracking-[-0.033em]">
                        Unlock Insights from Your PDFs
                      </h1>
                      <h2 className="text-white text-sm font-normal leading-normal @[480px]:text-base @[480px]:font-normal @[480px]:leading-normal">
                        Analyze, extract, and recommend with our powerful PDF
                        analysis tool.
                      </h2>
                    </div>
                    <button onClick={handleClick} className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 @[480px]:h-12 @[480px]:px-5 bg-[#19b3e6] text-[#111618] text-sm font-bold leading-normal tracking-[0.015em] @[480px]:text-base @[480px]:font-bold @[480px]:leading-normal @[480px]:tracking-[0.015em]">
                      <span className="truncate">Get Started</span>
                    </button>
                  </div>
                </div>
              </div>
              <h2 className="text-[#111618] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
                Key Features
              </h2>
              <div className="flex flex-col gap-10 px-4 py-10 @container">
                <div className="flex flex-col gap-4">
                  <h1 className="text-[#111618] tracking-light text-[32px] font-bold leading-tight @[480px]:text-4xl @[480px]:font-black @[480px]:leading-tight @[480px]:tracking-[-0.033em] max-w-[720px]">
                    Explore the Power of PDF Analyzer
                  </h1>
                  <p className="text-[#111618] text-base font-normal leading-normal max-w-[720px]">
                    Discover how our tool can help you unlock the full potential
                    of your PDF documents.
                  </p>
                </div>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(158px,1fr))] gap-3 p-0">
                  <div className="flex flex-1 gap-3 rounded-lg border border-[#dce3e5] bg-white p-4 flex-col">
                    <div
                      className="text-[#111618]"
                      data-icon="File"
                      data-size="24px"
                      data-weight="regular"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24px"
                        height="24px"
                        fill="currentColor"
                        viewBox="0 0 256 256"
                      >
                        <path d="M213.66,82.34l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM160,51.31,188.69,80H160ZM200,216H56V40h88V88a8,8,0,0,0,8,8h48V216Z" />
                      </svg>
                    </div>
                    <div className="flex flex-col gap-1">
                      <h2 className="text-[#111618] text-base font-bold leading-tight">
                        Heading &amp; Subheading Extraction
                      </h2>
                      <p className="text-[#637f88] text-sm font-normal leading-normal">
                        Automatically extract headings and subheadings from your
                        PDFs for easy navigation and understanding.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-1 gap-3 rounded-lg border border-[#dce3e5] bg-white p-4 flex-col">
                    <div
                      className="text-[#111618]"
                      data-icon="MagnifyingGlass"
                      data-size="24px"
                      data-weight="regular"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24px"
                        height="24px"
                        fill="currentColor"
                        viewBox="0 0 256 256"
                      >
                        <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z" />
                      </svg>
                    </div>
                    <div className="flex flex-col gap-1">
                      <h2 className="text-[#111618] text-base font-bold leading-tight">
                        PDF Recommendation Engine
                      </h2>
                      <p className="text-[#637f88] text-sm font-normal leading-normal">
                        Get personalized PDF recommendations based on your
                        persona and job to be done.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-1 gap-3 rounded-lg border border-[#dce3e5] bg-white p-4 flex-col">
                    <div
                      className="text-[#111618]"
                      data-icon="Robot"
                      data-size="24px"
                      data-weight="regular"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24px"
                        height="24px"
                        fill="currentColor"
                        viewBox="0 0 256 256"
                      >
                        <path d="M200,48H136V16a8,8,0,0,0-16,0V48H56A32,32,0,0,0,24,80V192a32,32,0,0,0,32,32H200a32,32,0,0,0,32-32V80A32,32,0,0,0,200,48Zm16,144a16,16,0,0,1-16,16H56a16,16,0,0,1-16-16V80A16,16,0,0,1,56,64H200a16,16,0,0,1,16,16Zm-52-56H92a28,28,0,0,0,0,56h72a28,28,0,0,0,0-56Zm-28,16v24H120V152ZM80,164a12,12,0,0,1,12-12h12v24H92A12,12,0,0,1,80,164Zm84,12H152V152h12a12,12,0,0,1,0,24ZM72,108a12,12,0,1,1,12,12A12,12,0,0,1,72,108Zm88,0a12,12,0,1,1,12,12A12,12,0,0,1,160,108Z" />
                      </svg>
                    </div>
                    <div className="flex flex-col gap-1">
                      <h2 className="text-[#111618] text-base font-bold leading-tight">
                        Intelligent Analysis
                      </h2>
                      <p className="text-[#637f88] text-sm font-normal leading-normal">
                        Our tool intelligently analyzes your PDFs to provide
                        valuable insights and recommendations.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <h2 className="text-[#111618] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
                How It Works
              </h2>
              <div className="grid grid-cols-[40px_1fr] gap-x-2 px-4">
                <div className="flex flex-col items-center gap-1 pt-3">
                  <div
                    className="text-[#111618]"
                    data-icon="Upload"
                    data-size="24px"
                    data-weight="regular"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24px"
                      height="24px"
                      fill="currentColor"
                      viewBox="0 0 256 256"
                    >
                      <path d="M240,136v64a16,16,0,0,1-16,16H32a16,16,0,0,1-16-16V136a16,16,0,0,1,16-16H80a8,8,0,0,1,0,16H32v64H224V136H176a8,8,0,0,1,0-16h48A16,16,0,0,1,240,136ZM85.66,77.66,120,43.31V128a8,8,0,0,0,16,0V43.31l34.34,34.35a8,8,0,0,0,11.32-11.32l-48-48a8,8,0,0,0-11.32,0l-48,48A8,8,0,0,0,85.66,77.66ZM200,168a12,12,0,1,0-12,12A12,12,0,0,0,200,168Z" />
                    </svg>
                  </div>
                  <div className="w-[1.5px] bg-[#dce3e5] h-2 grow" />
                </div>
                <div className="flex flex-1 flex-col py-3">
                  <p className="text-[#111618] text-base font-medium leading-normal">
                    Upload Your PDF
                  </p>
                  <p className="text-[#637f88] text-base font-normal leading-normal">
                    Drag and drop your PDF or use the upload button.
                  </p>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-[1.5px] bg-[#dce3e5] h-2" />
                  <div
                    className="text-[#111618]"
                    data-icon="MagnifyingGlass"
                    data-size="24px"
                    data-weight="regular"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24px"
                      height="24px"
                      fill="currentColor"
                      viewBox="0 0 256 256"
                    >
                      <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z" />
                    </svg>
                  </div>
                  <div className="w-[1.5px] bg-[#dce3e5] h-2 grow" />
                </div>
                <div className="flex flex-1 flex-col py-3">
                  <p className="text-[#111618] text-base font-medium leading-normal">
                    Analyze and Extract
                  </p>
                  <p className="text-[#637f88] text-base font-normal leading-normal">
                    Our tool extracts headings, subheadings, and other key
                    information.
                  </p>
                </div>
                <div className="flex flex-col items-center gap-1 pb-3">
                  <div className="w-[1.5px] bg-[#dce3e5] h-2" />
                  <div
                    className="text-[#111618]"
                    data-icon="Robot"
                    data-size="24px"
                    data-weight="regular"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24px"
                      height="24px"
                      fill="currentColor"
                      viewBox="0 0 256 256"
                    >
                      <path d="M200,48H136V16a8,8,0,0,0-16,0V48H56A32,32,0,0,0,24,80V192a32,32,0,0,0,32,32H200a32,32,0,0,0,32-32V80A32,32,0,0,0,200,48Zm16,144a16,16,0,0,1-16,16H56a16,16,0,0,1-16-16V80A16,16,0,0,1,56,64H200a16,16,0,0,1,16,16Zm-52-56H92a28,28,0,0,0,0,56h72a28,28,0,0,0,0-56Zm-28,16v24H120V152ZM80,164a12,12,0,0,1,12-12h12v24H92A12,12,0,0,1,80,164Zm84,12H152V152h12a12,12,0,0,1,0,24ZM72,108a12,12,0,1,1,12,12A12,12,0,0,1,72,108Zm88,0a12,12,0,1,1,12,12A12,12,0,0,1,160,108Z" />
                    </svg>
                  </div>
                </div>
                <div className="flex flex-1 flex-col py-3">
                  <p className="text-[#111618] text-base font-medium leading-normal">
                    Get Recommendations
                  </p>
                  <p className="text-[#637f88] text-base font-normal leading-normal">
                    Input your persona and job to be done to receive
                    personalized PDF recommendations.
                  </p>
                </div>
              </div>
              <div className="@container">
                <div className="flex flex-col justify-end gap-6 px-4 py-10 @[480px]:gap-8 @[480px]:px-10 @[480px]:py-20">
                  <div className="flex flex-col gap-2 text-center">
                    <h1 className="text-[#111618] tracking-light text-[32px] font-bold leading-tight @[480px]:text-4xl @[480px]:font-black @[480px]:leading-tight @[480px]:tracking-[-0.033em] max-w-[720px]">
                      Ready to Get Started?
                    </h1>
                    <p className="text-[#111618] text-base font-normal leading-normal max-w-[720px">
                      Sign up today and start analyzing your PDFs with ease.
                    </p>
                  </div>
                  <div className="flex flex-1 justify-center">
                    <div className="flex justify-center">
                      <button
                        className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 @[480px]:h-12 @[480px]:px-5 bg-[#19b3e6] text-[#111618] text-sm font-bold leading-normal tracking-[0.015em] @[480px]:text-base @[480px]:font-bold @[480px]:leading-normal @[480px]:tracking-[0.015em] grow"
                        onClick={handleClick}
                      >
                        <span className="truncate">Get Started</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <footer className="flex justify-center">
            <div className="flex max-w-[960px] flex-1 flex-col">
              <footer className="flex flex-col gap-6 px-5 py-10 text-center @container">
                <div className="flex flex-wrap items-center justify-center gap-6 @[480px]:flex-row @[480px]:justify-around">
                  <a
                    className="text-[#637f88] text-base font-normal leading-normal min-w-40"
                    href="#"
                  >
                    Terms of Service
                  </a>
                  <a
                    className="text-[#637f88] text-base font-normal leading-normal min-w-40"
                    href="#"
                  >
                    Privacy Policy
                  </a>
                  <a
                    className="text-[#637f88] text-base font-normal leading-normal min-w-40"
                    href="#"
                  >
                    Contact Us
                  </a>
                </div>
                <div className="flex flex-wrap justify-center gap-4">
                  <a href="#">
                    <div
                      className="text-[#637f88]"
                      data-icon="TwitterLogo"
                      data-size="24px"
                      data-weight="regular"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24px"
                        height="24px"
                        fill="currentColor"
                        viewBox="0 0 256 256"
                      >
                        <path d="M247.39,68.94A8,8,0,0,0,240,64H209.57A48.66,48.66,0,0,0,168.1,40a46.91,46.91,0,0,0-33.75,13.7A47.9,47.9,0,0,0,120,88v6.09C79.74,83.47,46.81,50.72,46.46,50.37a8,8,0,0,0-13.65,4.92c-4.31,47.79,9.57,79.77,22,98.18a110.93,110.93,0,0,0,21.88,24.2c-15.23,17.53-39.21,26.74-39.47,26.84a8,8,0,0,0-3.85,11.93c.75,1.12,3.75,5.05,11.08,8.72C53.51,229.7,65.48,232,80,232c70.67,0,129.72-54.42,135.75-124.44l29.91-29.9A8,8,0,0,0,247.39,68.94Zm-45,29.41a8,8,0,0,0-2.32,5.14C196,166.58,143.28,216,80,216c-10.56,0-18-1.4-23.22-3.08,11.51-6.25,27.56-17,37.88-32.48A8,8,0,0,0,92,169.08c-.47-.27-43.91-26.34-44-96,16,13,45.25,33.17,78.67,38.79A8,8,0,0,0,136,104V88a32,32,0,0,1,9.6-22.92A30.94,30.94,0,0,1,167.9,56c12.66.16,24.49,7.88,29.44,19.21A8,8,0,0,0,204.67,80h16Z" />
                      </svg>
                    </div>
                  </a>
                  <a href="#">
                    <div
                      className="text-[#637f88]"
                      data-icon="FacebookLogo"
                      data-size="24px"
                      data-weight="regular"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24px"
                        height="24px"
                        fill="currentColor"
                        viewBox="0 0 256 256"
                      >
                        <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm8,191.63V152h24a8,8,0,0,0,0-16H136V112a16,16,0,0,1,16-16h16a8,8,0,0,0,0-16H152a32,32,0,0,0-32,32v24H96a8,8,0,0,0,0,16h24v63.63a88,88,0,1,1,16,0Z" />
                      </svg>
                    </div>
                  </a>
                  <a href="#">
                    <div
                      className="text-[#637f88]"
                      data-icon="LinkedinLogo"
                      data-size="24px"
                      data-weight="regular"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24px"
                        height="24px"
                        fill="currentColor"
                        viewBox="0 0 256 256"
                      >
                        <path d="M216,24H40A16,16,0,0,0,24,40V216a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V40A16,16,0,0,0,216,24Zm0,192H40V40H216V216ZM96,112v64a8,8,0,0,1-16,0V112a8,8,0,0,1,16,0Zm88,28v36a8,8,0,0,1-16,0V140a20,20,0,0,0-40,0v36a8,8,0,0,1-16,0V112a8,8,0,0,1,15.79-1.78A36,36,0,0,1,184,140ZM100,84A12,12,0,1,1,88,72,12,12,0,0,1,100,84Z" />
                      </svg>
                    </div>
                  </a>
                </div>
                <p className="text-[#637f88] text-base font-normal leading-normal">
                  © 2024 PDF Analyzer. All rights reserved.
                </p>
              </footer>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
};

export default Home;
