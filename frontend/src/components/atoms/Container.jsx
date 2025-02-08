const Container = ({children, className})=>{
    return (
        <div className={`w-full h-full p-4 md:p-10 ${className}`}>
            {children}
        </div>
    )
}
export default Container;