import React from 'react';
import { useNavigate } from 'react-router-dom';

const Service = () => {
  const navigate = useNavigate();

  const goToHeadingExtraction = () => {
    // Navigate to the route for heading extraction
    // Replace "/heading-extraction" with your actual route
    navigate('/heading-extraction');
  };

  const goToRecommendation = () => {
    // Navigate to the route for recommendation
    // Replace "/recommendation" with your actual route
    navigate('/recommendation');
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
                  Dashboard
                </a>
                <a
                  className="text-[#111618] text-sm font-medium leading-normal"
                  href="#"
                >
                  Settings
                </a>
                <a
                  className="text-[#111618] text-sm font-medium leading-normal"
                  href="#"
                >
                  Help
                </a>
              </div>
              <div
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
                style={{
                  backgroundImage:
                    'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCOU0LqG2Di8V0WQbcPWh7nRpcvbbXyG8SKFodSYKHWvtjZ4Z_6n-UdgcZrahP_4hz4Gyl12UtzJ8LN9p8Eiz0eRqZxXU9kFYjhm9dObTlP1UaAyfSEn6Q8Bda0SdGLyhG9QsZRFOWNxs2RbMKiKYfFns-01hz7NV3f9fhpeLev6j3w3QJhkjxJlr4Ds27sAqqgP5kHiPZcGO3QRJFQFAnCY0Qo-brDyHGmV0Ubfz4i22D64iGgMH9dtsUjIAqzkqSExdawrh4lGno")'
                }}
              />
            </div>
          </header> */}
          <div className="px-40 flex flex-1 justify-center py-5">
            <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
              <div className="flex flex-wrap justify-between gap-3 p-4">
                <p className="text-[#111618] tracking-light text-[32px] font-bold leading-tight min-w-72">
                  Select a Service
                </p>
              </div>
              <div className="p-4">
                <div className="flex items-stretch justify-between gap-4 rounded-lg">
                  <div className="flex flex-[2_2_0px] flex-col gap-4">
                    <div className="flex flex-col gap-1">
                      <p className="text-[#111618] text-base font-bold leading-tight">
                        Heading Extraction
                      </p>
                      <p className="text-[#637f88] text-sm font-normal leading-normal">
                        Extract headings and subheadings from your PDF documents to
                        create a structured outline.
                      </p>
                    </div>
                    <button
                      onClick={goToHeadingExtraction}
                      className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-8 px-4 flex-row-reverse bg-[#f0f3f4] text-[#111618] text-sm font-medium leading-normal w-fit"
                    >
                      <span className="truncate">Select Heading Extraction</span>
                    </button>
                  </div>
                  <div
                    className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-lg flex-1"
                    style={{
                      backgroundImage:
                        'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAG9_N2CBU8-TZ3w7c9PkRTug-6GfWdutop7nyyzR3su9DtEZbiTStysrUX8Q951Qe1XUGt6HNocIoGQCl5NfxOVlHwfSk4HOm9r-jux9gYXprDzLwQSPrsGqKhGIojUFA3wInOh2E1Vc3pnKtLdKBqvecZX83VPQzpeAp5M5Ifj26y8eKHKe_CxypQ9zlF4cNQme4GPr1c5WMc_jVivGyS4c_KiexBYb_5JSOSOM5dK8MBMQEBREoNaSYzh8R4NDgKthyrF2Zz5JA")',
                    }}
                  />
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-stretch justify-between gap-4 rounded-lg">
                  <div className="flex flex-[2_2_0px] flex-col gap-4">
                    <div className="flex flex-col gap-1">
                      <p className="text-[#111618] text-base font-bold leading-tight">
                        Recommendation
                      </p>
                      <p className="text-[#637f88] text-sm font-normal leading-normal">
                        Receive personalized recommendations based on the content of
                        your PDF documents.
                      </p>
                    </div>
                    <button
                      onClick={goToRecommendation}
                      className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-8 px-4 flex-row-reverse bg-[#f0f3f4] text-[#111618] text-sm font-medium leading-normal w-fit"
                    >
                      <span className="truncate">Select Recommendation</span>
                    </button>
                  </div>
                  <div
                    className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-lg flex-1"
                    style={{
                      backgroundImage:
                        'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDWql0vNnHi_nwQRh-jGYf-f4AHiIf6zUDNZeJmo5L9ORJlndTDErSbpeJqF7yFQiPzMzeWu1mwJWkRdwfX7kmeSOqehacdQfEDa4OK0f0CFouIYCI3X5SDampd0w3048WcPAV4PgautOFeFVHW1TM_JDddpNsWkfg-69sCfKx8bbY6bxChBab7YJPZqK63KbdThAlIzBWocOQCB8m_N4mqrcKGn0zPP3TdKLJCpP7O0RAbd7VmjLsdEoSkyZampVKSrKHCBaB3jSc")',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Service;
