#version 330

in vec2 v_uv;



out vec4 fragColor;

uniform sampler2D u_tex_position;
uniform sampler2D u_tex_normal;
uniform sampler2D u_tex_albedo;

const int MAX_LIGHTS = 8;


//light structs and uniforms
struct Light {
    vec4 position;
    vec4 direction;
    vec4 color;
    float linear_att;
    float quadratic_att;
    float spot_inner_cosine;
    float spot_outer_cosine;
    mat4 view_projection;
    int type; // 0 - directional; 1 - point; 2 - spot
    int cast_shadow;
};

uniform vec3 u_cam_pos; 
uniform int u_num_lights;

layout (std140) uniform u_lights_ubo
{
    Light lights[MAX_LIGHTS]; 
};

void main(){
    vec3 position = texture(u_tex_position, v_uv).xyz;
    vec3 normal = texture(u_tex_normal, v_uv).xyz;
    vec4 albedo = texture(u_tex_albedo, v_uv).xyzw;
    vec3 diffuse = albedo.xyz;
    float specular = albedo.w;

    vec3 final_color = vec3 (0.0, 0.0, 0.0);
    for (int i = 0; i < u_num_lights; i++) {
        float attenuation = 1.0;
        
        float spot_cone_intensity = 1.0;
        
        vec3 L = normalize(-lights[i].direction.xyz); // for directional light
        vec3 N = normalize(normal); //normal
        vec3 R = reflect(-L,N); //reflection vector
        vec3 V = normalize(u_cam_pos - position); //to camera
        
        if (lights[i].type > 0) {
        
            vec3 point_to_light = lights[i].position.xyz - position;
            L = normalize(point_to_light);

            // soft spot cone
            if (lights[i].type == 2) {
                vec3 D = normalize(lights[i].direction.xyz);
                float cos_theta = dot(D, -L);
                
                float numer = cos_theta - lights[i].spot_outer_cosine;
                float denom = lights[i].spot_inner_cosine - lights[i].spot_outer_cosine;
                spot_cone_intensity = clamp(numer/denom, 0.0, 1.0);


            }
            
            //attenuation
            float distance = length(point_to_light);
            attenuation = 1.0 / (1.0 + lights[i].linear_att * distance + lights[i].quadratic_att * (distance * distance));
        }
        
        
        //diffuse color
        float NdotL = max(0.0, dot(N, L));
        vec3 diffuse_color = NdotL * diffuse * lights[i].color.xyx;
                             
        //specular color
        float RdotV = max(0.0, dot(R, V)); //calculate dot product
        RdotV = pow(RdotV, 1.0f); //raise to power for glossiness effect
        vec3 specular_color = RdotV * lights[i].color.xyz * specular;

        //shadow
        
        vec4 position_light_space = lights[i].view_projection * vec4(position, 1.0);
        
        // float shadow = (lights[i].cast_shadow == 1 ? shadowCalculationPoisson(position_light_space, NdotL, i) : 0.0);

        //final color
        final_color += ((diffuse_color + specular_color) * attenuation * spot_cone_intensity);//* (1.0 - shadow);
    }
    vec3 col = position;
    fragColor = vec4(final_color, 1.0);
    
}
