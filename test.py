def Sandwiched_Vowel(s):
#     #Complete the function
    vowels = 'aeiou'
    # res = []
    result = ""
    n = len(s)
    
    
    
#     # # boundary condition 
#     # for i in range(n):
#     #     if  i==0 or i==n-1:
#     #         res.append(s[i])
#     #         continue
        

#     #     #check vowel and left and right consonant
#     #     is_v = s[i] in V
#     #     l_const = s[i-1] not in V
#     #     r_const = s[i+1] not in V
        
#     #     if is_v and l_const and r_cosnt:
#     #         continue:     # as we didnt find the right and left const between the vowel
#     #     #if not then put that
#     #     result.append(s[i])
    

         
    for i in range(n):
        
        if ( 0< i <n-1 and s[i] in vowels and s[i-1] not in vowels and s[i+1] not in vowels):
    #or i in range(n):
        #if ( 0< i <n-1 and s[i] in vowels and s[i-1] not in vowels and s[i+1] not in vowels): 
            continue
        result += s[i]
        #cghj
        
       # c gh j
        
#         # s[i] in vowels:
#         #     if s[i-1] not in vowels and s[i+1] not in vowels:
#         #         result += s[i-1] + s[i+1]    riir
    return result
    
    
    
print(Sandwiched_Vowel("riir"))