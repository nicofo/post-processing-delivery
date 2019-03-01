#version 330

in vec2 v_uv;

layout (location = 0) out vec4 g_phong;
layout (location = 1) out vec3 g_bloom;


out vec4 fragColor;

uniform sampler2D u_tex_position;
uniform sampler2D u_tex_normal;
uniform sampler2D u_tex_albedo;
uniform sampler2D u_tex_ambient;
uniform sampler2D u_tex_bloom;

const int MAX_LIGHTS = 8;

//shadows
uniform sampler2D u_shadow_map[MAX_LIGHTS];

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

float shadowCalculationPCF2(vec4 fragment_light_space, float NdotL, int light_index) {
    
    //gl_position does this divide automatically. But we need to do it manually
    //result is current fragment coordinates in light clip space
    vec3 proj_coords = fragment_light_space.xyz / fragment_light_space.w;

    //openGL clip space goes from -1 to +1, but our texture values are from 0->1
    //so lets remap our projected coords to 0->1
    proj_coords = proj_coords * 0.5 + 0.5;

    //predeclare
    float shadow = 0.0;

    //we only want to deal with stuff which is inside the light frustum. So we clamp
    //and do not process anything outside
    if (clamp(proj_coords, 0.0, 1.0) == proj_coords) {

        //current depth of the projected sample
        float current_depth = proj_coords.z;

        //BASIC: now get depth from our shadow map, at the x,y location in light clip space
        //float shadow_map_depth = texture(u_shadow_map, proj_coords.xy).r;

        //float bias = 0.005; // crude bias
        //the crude bias is not good as surfaces facing light (NdotL = 1) need less bias, whereas
        //surfaces perpedicular to light need a large bias
        float bias = max(0.05 * (1.0 - NdotL), 0.005); 
        //BASIC: now test to see if current depth is greater than shadow map depth
        //shadow = current_depth - bias > shadow_map_depth ? 1.0 : 0.0;

        //PCF

        vec2 texel_size = 1.0 / textureSize(u_shadow_map[light_index], 0);
        for (int x = -1; x <= 1; x++) {
            for (int y = -1; y <= 1; y++) {
                float pcf_depth = texture(u_shadow_map[light_index],
                                          proj_coords.xy + vec2(x,y) * texel_size).r;
                shadow += current_depth - bias > pcf_depth ? 1.0 : 0.0;
            }
        }
        shadow /= 9.0;
    }
    
    return shadow;
}

float shadowCalculationPCF(int light_index, vec4 fragment_light_space, float NdotL ) {
    float shadow = 0.0;
    //homogenous coord
    vec3 projected_coords = fragment_light_space.xyz / fragment_light_space.w;
    //normalize
    projected_coords = projected_coords * 0.5 + 0.5;
    vec2 texel_size = 1.0 / textureSize(u_shadow_map[light_index], 0);
    if (clamp(projected_coords, 0.0, 1.0) == projected_coords) {
        //distances
        float current_depth = projected_coords.z;
        float bias = max(0.05 * (1.0 - NdotL), 0.005);
        float shadow_map_depth = 0.0;
        //float shadow_difference = current_depth - texture(u_shadow_map[light_index], projected_coords.xy).r;
        int size = 10;//int(round(shadow_difference * 300));
        for (int i = -size; i <=size; i++) {
            for (int j = -size; j <=size; j++) {
                float shadow_map_depth = texture(u_shadow_map[light_index], projected_coords.xy + vec2(j,i) *texel_size).r;
                shadow += current_depth - bias> shadow_map_depth ? 1.0 : 0.0;
            }
        }
        
        
        shadow = shadow/ ((size*4*size) + size);
          
    }
    

    return shadow;
}

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
        
        float shadow = (lights[i].cast_shadow == 1 ? shadowCalculationPCF(i, position_light_space, NdotL) : 0.0);

        //final color
        final_color += ((diffuse_color + specular_color) * attenuation * spot_cone_intensity) * (1.0 - shadow);
    }
    final_color += texture(u_tex_ambient, v_uv).xyz;
    vec3 col = position;
    g_phong = vec4(final_color, 1.0);



    //float weight[5] = float[] (0.227027, 0.1945946, 0.1216216, 0.054054, 0.016216);
    // check bloom
    vec2 tex_offset = 1.0 / textureSize(u_tex_bloom, 0);
    vec3 result = vec3(0,0,0);//texture(image, v_uv).rgb * weight[0];
    int size = 10;
    for(int i = -size; i < size; ++i) {
        for(int j = -size; j < size; ++j) {
            result += texture(u_tex_bloom, v_uv + vec2(tex_offset.x * j * 7, tex_offset.y * i * 7)).rgb;
        }
    }
    g_bloom = result / ((2 * size+1) *(2 * size +1));

}
