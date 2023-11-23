"use client"
export default function Days() {
    const today = new Date();
    const date = today.getDate();
    const day = today.toLocaleString("en-US", { weekday: "short" })

    return (
        <div className='aspect-square w-[165px] h-[165px] bg-[#00ADB5] rounded-[20px]'>
            <div className="text-[50px] text-roboto text-center" style={{ color: '#FFFFFF' }}>
                <p>{day}</p>
                <p>{date}</p>
            </div>
        </div>
    )
}